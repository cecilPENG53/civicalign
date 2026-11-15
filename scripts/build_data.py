import json, sys, math
d = json.load(open(sys.argv[1], encoding='utf-8'))
LAT0, LON0 = -33.8185, 151.0050
KX = math.cos(math.radians(LAT0))*111320; KY = 110574
def xy(p): return (round((p['lon']-LON0)*KX, 1), round((p['lat']-LAT0)*KY, 1))
P = [(-142,175),(-135,129),(-127,91),(-119,47),(-114,3),(-108,-55),(-101,-110),(-93,-170),(-91,-191),(-55,-184),(-11,-157),(16,-146),(91,-139),(145,-131),(199,-117),(215,-112),(195,-90),(166,-42),(132,3),(108,31),(81,57),(59,76),(13,112),(-33,143),(-72,165),(-131,189)]
X0, X1, Y0, Y1 = -330, 400, -310, 330
def inpoly(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        a = poly[i]; b = poly[i-1]
        if (a[1] > y) != (b[1] > y) and x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: c = not c
    return c
def area(pts):
    return abs(sum(pts[i][0]*pts[i-1][1]-pts[i-1][0]*pts[i][1] for i in range(len(pts))))/2
def cen(pts): return (sum(p[0] for p in pts)/len(pts), sum(p[1] for p in pts)/len(pts))
def inview(pts): c = cen(pts); return X0 < c[0] < X1 and Y0 < c[1] < Y1
def num(s):
    try: return float(str(s).split()[0].replace('m',''))
    except: return None
def flat(pts): return [v for p in pts for v in p]
B, R, RL, G, PL = [], [], [], [], []
W = {'trunk':14,'primary':13,'secondary':11,'tertiary':9,'tertiary_link':7,'residential':8,'unclassified':8,'living_street':5,'service':4,'busway':7,'pedestrian':5}
for e in d['elements']:
    t = e.get('tags', {})
    if e['type'] == 'relation':
        rings = [m['geometry'] for m in e.get('members', []) if m.get('role') == 'outer' and 'geometry' in m]
        if not rings: continue
        geom = max(rings, key=len)
    else:
        geom = e.get('geometry')
    if not geom: continue
    pts = [xy(p) for p in geom]
    if 'building' in t:
        if pts[0] == pts[-1]: pts = pts[:-1]
        if len(pts) < 3 or not inview(pts): continue
        if t.get('building') in ('roof',) or t.get('location') == 'underground': continue
        h = num(t.get('height')); lv = num(t.get('building:levels')); known = 1
        if h is None:
            if lv: h = lv*3.2
            else: h = 7; known = 0
        a = area(pts)
        B.append({'p': flat(pts), 'h': round(h, 1), 'k': known, 'a': round(a), 'in': int(inpoly(cen(pts), P)), 'n': t.get('name', ''), 'lv': lv or 0,
                  'x': int(any(k in t for k in ('amenity','railway','public_transport','heritage','historic')) or t.get('building') in ('train_station','church','public','civic','transportation'))})
    elif t.get('railway') == 'rail':
        if t.get('tunnel'): continue
        RL.append(flat(pts))
    elif 'highway' in t:
        hw = t['highway']
        if hw not in W or t.get('tunnel') or t.get('indoor'): continue
        if hw == 'pedestrian' and pts[0] == pts[-1] and len(pts) > 3:
            if inview(pts): PL.append(flat(pts[:-1]))
            continue
        if not any(X0 < p[0] < X1 and Y0 < p[1] < Y1 for p in pts): continue
        R.append({'w': W[hw], 'p': flat(pts)})
    elif 'leisure' in t or 'landuse' in t:
        if pts[0] == pts[-1] and len(pts) > 3 and inview(pts): G.append({'p': flat(pts[:-1]), 'a': round(area(pts))})
if len(sys.argv) > 3:
    for b in sorted([b for b in B if b['in']], key=lambda b: -b['a']):
        print(b['a'], 'lv', b['lv'], 'h', b['h'], 'excl', b['x'], b['n'], [round(v) for v in cen(list(zip(b['p'][::2], b['p'][1::2])))])
out = {'B': B, 'R': R, 'RL': RL, 'G': G, 'PL': PL, 'P': flat(P), 'ts': d['osm3s']['timestamp_osm_base']}
json.dump(out, open(sys.argv[2], 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)
print('B', len(B), 'inP', sum(b['in'] for b in B), 'R', len(R), 'RL', len(RL), 'G', len(G), 'PL', len(PL), 'green in P', sum(g['a'] for g in G if inpoly(cen(list(zip(g['p'][::2], g['p'][1::2]))), P)), 'P area', round(area(P)))
