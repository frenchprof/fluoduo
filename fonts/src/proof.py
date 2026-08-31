import skia, core

def render(items, path_out, cols=8, cell=(300, 380), scale=0.28, label=True):
    """items: list of (name, skia.Path outline, advance)."""
    cw, ch = cell
    rows = (len(items) + cols - 1) // cols
    W, H = cw*cols, ch*rows
    surf = skia.Surface(W, H)
    cv = surf.getCanvas()
    cv.clear(skia.ColorWHITE)
    ink = skia.Paint(Color=skia.ColorBLACK, AntiAlias=True)
    grid = skia.Paint(Color=skia.ColorSetARGB(255,215,225,240), AntiAlias=True,
                      Style=skia.Paint.kStroke_Style, StrokeWidth=1)
    adv_p = skia.Paint(Color=skia.ColorSetARGB(255,250,205,205), AntiAlias=True,
                       Style=skia.Paint.kStroke_Style, StrokeWidth=1)
    txt = skia.Paint(Color=skia.ColorSetARGB(255,120,120,140), AntiAlias=True)
    font = skia.Font(skia.Typeface(''), 13)
    for i, (name, p, adv) in enumerate(items):
        r, c = divmod(i, cols)
        ox, oy = c*cw + 40, r*ch + ch - 110
        cv.save(); cv.translate(ox, oy); cv.scale(scale, -scale)
        for y in (0, core.XH, core.CAP):
            cv.drawLine(-200, y, 1400, y, grid)
        cv.drawLine(0, -420, 0, 1100, grid)
        if adv: cv.drawLine(adv, -420, adv, 1100, adv_p)
        if p: cv.drawPath(p, ink)
        cv.restore()
        if label:
            cv.drawString(f"{name}  {adv}", c*cw+8, r*ch+ch-14, font, txt)
    surf.makeImageSnapshot().save(path_out, skia.kPNG)
