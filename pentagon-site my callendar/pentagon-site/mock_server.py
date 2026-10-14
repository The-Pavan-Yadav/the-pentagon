import json, datetime as dt
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

T = dt.date.today()
SUBJ = ['Mathematics', 'Science', 'English', 'Social Science', 'Tamil']
def img(c): return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='%23" + c + "'/></svg>"
def classes(d):
    if d.weekday() == 6: return []
    out = []
    for i, h in enumerate((9, 11)):
        s = SUBJ[(d.weekday() * 2 + i) % 5]
        st = dt.datetime(d.year, d.month, d.day, h).isoformat()
        out.append({'id': d.isoformat() + str(i), 'subject': s, 'teacher': 'Teacher ' + str(i + 1), 'start': st, 'end': dt.datetime(d.year, d.month, d.day, h + 1).isoformat(), 'topic': 'Topic ' + str(d.day), 'recordingUrl': ''})
    return out
def year():
    y = T.year if T.month >= 6 else T.year - 1
    days, d = {}, dt.date(y, 6, 1)
    while d <= dt.date(y + 1, 4, 30):
        c = classes(d)
        if c: days[d.isoformat()] = {'classes': c, 'notes': {'mine': 0, 'board': 1, 'ai': 1} if d <= T else {}}
        d += dt.timedelta(days=1)
    exam = (T + dt.timedelta(days=10)).isoformat()
    days.setdefault(exam, {})['events'] = [{'kind': 'exam', 'title': 'Unit test'}]
    return {'subjects': [{'name': s} for s in SUBJ], 'days': days, 'progress': {'syllabusPct': 38, 'attendancePct': 94, 'daysWithNotes': 31, 'daysTotal': 54},
            'upcoming': [{'date': exam, 'title': 'Unit test', 'sub': 'Mathematics', 'kind': 'exam'}]}
def day(date):
    d = dt.date.fromisoformat(date); c = classes(d); past = d <= T
    return {'academicYear': '2026 to 27', 'dayNumber': 54, 'daysTotal': 190, 'attendance': 'present' if past and c else None, 'classes': c,
            'syllabus': [{'subject': x['subject'], 'unit': 'Unit 1', 'chapter': 'Chapter 4', 'topic': x['topic'], 'pages': '62 to 68', 'status': 'taught'} for x in c] if past else [],
            'notes': {'handwritten': [], 'board': [{'id': 'b1', 'imageUrl': img('C9E4DE'), 'source': 'smartboard', 'teacher': 'Teacher 1'}] if past and c else [],
                      'ai': {'status': 'ready', 'sources': '1 board photo', 'summary': 'A short summary of the class.', 'keyConcepts': ['First key idea', 'Second key idea'], 'formulas': ['a + b = c'], 'mistakes': ['Forgetting the sign'], 'terms': ['term one', 'term two']} if past and c else None},
            'homework': [], 'resources': []}
class H(BaseHTTPRequestHandler):
    def _send(self, obj):
        b = json.dumps(obj).encode(); self.send_response(200)
        self.send_header('Content-Type', 'application/json'); self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*'); self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self): self._send({})
    def do_POST(self): self._send({'text': 'Example converted text', 'ok': True})
    def do_GET(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        if u.path.endswith('/calendar/year'): self._send(year())
        elif u.path.endswith('/calendar/day'): self._send(day(q.get('date', [T.isoformat()])[0]))
        elif u.path.endswith('/search'): self._send({'results': []})
        else: self._send({})
HTTPServer(('localhost', 5050), H).serve_forever()