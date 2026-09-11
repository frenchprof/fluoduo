"""Crop a PNG's trailing whitespace. Headless Chromium refuses to paint the last
line when the viewport hugs the content, so sheets are shot tall and trimmed here."""
import zlib, struct, io, sys

def read(p):
    d = io.open(p, 'rb').read(); pos, idat = 8, b''
    while pos < len(d):
        ln = struct.unpack('>I', d[pos:pos+4])[0]; typ = d[pos+4:pos+8]
        if typ == b'IHDR': w, h, bd, ct = struct.unpack('>IIBB', d[pos+8:pos+18])
        elif typ == b'IDAT': idat += d[pos+8:pos+8+ln]
        pos += 12 + ln
    raw = zlib.decompress(idat); ch = {0:1, 2:3, 4:2, 6:4}[ct]; stride = w*ch
    out, prev, i = [], bytearray(stride), 0
    for _ in range(h):
        f = raw[i]; i += 1
        line = bytearray(raw[i:i+stride]); i += stride
        for x in range(stride):
            a = line[x-ch] if x >= ch else 0; b = prev[x]
            c = prev[x-ch] if x >= ch else 0
            if f == 1: line[x] = (line[x]+a) & 255
            elif f == 2: line[x] = (line[x]+b) & 255
            elif f == 3: line[x] = (line[x]+(a+b)//2) & 255
            elif f == 4:
                p_ = a+b-c; pa, pb, pc = abs(p_-a), abs(p_-b), abs(p_-c)
                line[x] = (line[x] + (a if (pa <= pb and pa <= pc) else (b if pb <= pc else c))) & 255
        out.append(bytes(line)); prev = line
    return w, h, ch, ct, out

def write(p, w, rows, ch, ct):
    raw = b''.join(b'\x00' + r for r in rows)
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t+d) & 0xffffffff)
    io.open(p, 'wb').write(
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', w, len(rows), 8, ct, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

src, dst, pad = sys.argv[1], sys.argv[2], int(sys.argv[3])
w, h, ch, ct, rows = read(src)
last = max(y for y, r in enumerate(rows) if any(r[x] < 200 for x in range(0, w*ch, ch)))
keep = min(h, last + pad)
write(dst, w, rows[:keep], ch, ct)
print(f"{src}: {w}x{h} -> {w}x{keep} (last ink row {last})")
