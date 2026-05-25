#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GLOREX Ebook Builder — PIPS30-style design
شغّل هذا الملف لإنتاج الـ PDF:
    python3 build.py
"""

import os, sys, math
import arabic_reshaper
from bidi.algorithm import get_display

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Paragraph, Spacer, PageBreak, NextPageTemplate,
    Table, TableStyle, Flowable,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage

sys.path.insert(0, os.path.dirname(__file__))
import content as C

# ── Fonts ─────────────────────────────────────────────────────────────────────
pdfmetrics.registerFont(TTFont('Body',       '/Library/Fonts/Arial Unicode.ttf'))
pdfmetrics.registerFont(TTFont('ArabicBold', '/System/Library/Fonts/SFArabicRounded.ttf'))
pdfmetrics.registerFont(TTFont('Latin',      '/System/Library/Fonts/SFNS.ttf'))
pdfmetrics.registerFont(TTFont('LatinBold',  '/System/Library/Fonts/SFNS.ttf'))

# ── Colors ────────────────────────────────────────────────────────────────────
RED        = HexColor('#8B0000')
RED_DARK   = HexColor('#5C0000')
RED_ACCENT = HexColor('#A00000')
GRAY_BG    = HexColor('#F0F0F0')
GRAY_LINE  = HexColor('#CCCCCC')
TEXT       = HexColor('#1A1A1A')
MUTED      = HexColor('#555555')

# ── Page geometry ─────────────────────────────────────────────────────────────
PW, PH   = A4                      # 595 × 842 pt
ML       = 1.8 * cm
MR       = 1.8 * cm
MT       = 2.5 * cm
MB       = 2.2 * cm
CW       = PW - ML - MR

IMAGES   = os.path.join(os.path.dirname(__file__), 'images')
OUTPUT   = os.path.join(os.path.dirname(__file__), 'glorex_trading_ebook.pdf')
LOGO     = '/tmp/glorex_logo.png'

# ── Arabic helper ─────────────────────────────────────────────────────────────
def ar(text):
    return get_display(arabic_reshaper.reshape(str(text)))

# ── Styles ────────────────────────────────────────────────────────────────────
def _S(name, **kw):
    d = dict(fontName='Body', wordWrap='RTL', alignment=TA_RIGHT, textColor=TEXT, spaceAfter=6)
    d.update(kw)
    return ParagraphStyle(name, **d)

ST = {
    'body':     _S('body',  fontSize=12, leading=24),
    'body_j':   _S('bodyj', fontSize=12, leading=24, alignment=TA_RIGHT),
    'h_page':   _S('hpage', fontSize=38, leading=46, textColor=TEXT,
                             fontName='Body', spaceBefore=0, spaceAfter=10),
    'h_sub':    _S('hsub',  fontSize=14, leading=22, textColor=RED,
                             fontName='Body', spaceAfter=14),
    'bullet':   _S('bul',   fontSize=12, leading=24, rightIndent=8),
    'check':    _S('chk',   fontSize=12, leading=26, rightIndent=8),
    'cap':      _S('cap',   fontSize=9,  leading=16, textColor=MUTED, alignment=TA_CENTER),
    'copy':     _S('copy',  fontSize=11, leading=22, textColor=MUTED, alignment=TA_CENTER),
    'dis':      _S('dis',   fontSize=10, leading=18, textColor=MUTED),
    'toc_h':    _S('toch',  fontSize=28, leading=38, textColor=TEXT,
                             fontName='Body', spaceAfter=14),
    'toc_e':    _S('toce',  fontSize=12, leading=26, textColor=TEXT),
    'toc_pg':   _S('tocpg', fontSize=12, leading=26, textColor=RED,
                             alignment=TA_LEFT, fontName='Latin'),
    'toc_ch':   _S('tocch', fontSize=11, leading=20, textColor=MUTED),
    'welcome_h':_S('welh',  fontSize=36, leading=44, textColor=TEXT,
                             fontName='Body', spaceAfter=10),
    'welcome_s':_S('wels',  fontSize=14, leading=22, textColor=RED,
                             fontName='Body', spaceAfter=12),
}

# ── Logo ──────────────────────────────────────────────────────────────────────
_logo_ir = None
def logo_ir():
    global _logo_ir
    if _logo_ir is None: _logo_ir = ImageReader(LOGO)
    return _logo_ir

# ═══════════════════════════════════════════════════════
#   CUSTOM FLOWABLES
# ═══════════════════════════════════════════════════════

class DiagonalLines(Flowable):
    """Subtle diagonal line watermark — top-right area like reference."""
    def __init__(self, x, y, w, h, color=HexColor('#E8E8E8'), gap=12):
        super().__init__()
        self._x = x; self._y = y; self._w = w; self._h = h
        self.color = color; self.gap = gap
        self.width = 0; self.height = 0

    def draw(self):
        c = self.canv
        c.saveState()
        c.setStrokeColor(self.color)
        c.setLineWidth(0.7)
        # Draw diagonal lines in a rectangle
        total = self._w + self._h
        n = int(total / self.gap) + 2
        for i in range(n):
            ox = i * self.gap
            x1 = self._x + ox; y1 = self._y + self._h
            x2 = self._x + ox - self._h; y2 = self._y
            # Clip to rect bounds
            if x1 > self._x + self._w: x1 = self._x + self._w
            c.line(x1, y1, x2, y2)
        c.restoreState()

    def wrap(self, aW, aH): return (0, 0)


class NumberBox(Flowable):
    """Numbered red box — like the 1/2 boxes in the reference."""
    def __init__(self, number, text, width=CW):
        super().__init__()
        self.number = str(number)
        self.text   = text
        self.width  = width
        self.height = 52

    def draw(self):
        c = self.canv
        # Full red background
        c.setFillColor(RED)
        c.roundRect(0, 0, self.width, self.height, 4, fill=1, stroke=0)
        # Number (big, right side for RTL)
        c.setFont('LatinBold', 32)
        c.setFillColor(Color(1, 1, 1, alpha=0.25))
        c.drawString(self.width - 40, 8, self.number)
        # Divider line
        c.setStrokeColor(Color(1, 1, 1, alpha=0.3))
        c.setLineWidth(0.8)
        c.line(self.width - 50, 10, self.width - 50, self.height - 10)
        # Text (Body/Arial Unicode handles both Arabic & Latin)
        c.setFillColor(white)
        c.setFont('Body', 11)
        text_w = self.width - 65
        label = ar(self.text)
        # Wrap text manually
        lines = self._wrap_text(c, label, text_w, 'Body', 11)
        y = self.height - 18
        for line in lines[:2]:
            c.drawRightString(self.width - 56, y, line)
            y -= 16

    def _wrap_text(self, c, text, max_w, font, size):
        c.setFont(font, size)
        words = text.split()
        lines = []
        current = ''
        for w in words:
            test = (current + ' ' + w).strip()
            if c.stringWidth(test, font, size) <= max_w:
                current = test
            else:
                if current: lines.append(current)
                current = w
        if current: lines.append(current)
        return lines

    def wrap(self, aW, aH): return (self.width, self.height)


class ChartBox(Flowable):
    """Image placeholder or real image."""
    def __init__(self, filepath, caption='', width=CW, height=200):
        super().__init__()
        self.filepath = filepath; self.caption = caption
        self.width = width; self.height = height

    def draw(self):
        c = self.canv
        cap_h = 20 if self.caption else 0
        img_h = self.height - cap_h - 4

        if self.filepath and os.path.exists(self.filepath):
            c.drawImage(ImageReader(self.filepath),
                        0, cap_h+4, width=self.width, height=img_h,
                        preserveAspectRatio=True, anchor='c', mask='auto')
        else:
            c.setFillColor(GRAY_BG)
            c.setStrokeColor(GRAY_LINE)
            c.setLineWidth(1)
            c.rect(0, cap_h+4, self.width, img_h, fill=1, stroke=1)
            cx, cy = self.width/2, cap_h + 4 + img_h/2
            c.setStrokeColor(HexColor('#BBBBBB')); c.setFillColor(HexColor('#BBBBBB'))
            c.setLineWidth(1.5)
            c.circle(cx, cy+10, 18, fill=0, stroke=1)
            c.circle(cx, cy+10, 7, fill=1, stroke=0)
            c.roundRect(cx-27, cy+1, 54, 36, 4, fill=0, stroke=1)
            c.setFont('Body', 10); c.setFillColor(HexColor('#999999'))
            c.drawCentredString(self.width/2, cap_h+20, ar('[ أضف الصورة هنا ]'))

        if self.caption:
            c.setFont('Body', 9); c.setFillColor(MUTED)
            c.drawCentredString(self.width/2, 4, ar(self.caption))

    def wrap(self, aW, aH): return (self.width, self.height)


class TradeTable(Flowable):
    def __init__(self, number, width=CW):
        super().__init__()
        self.number = number; self.width = width; self.height = 188

    def draw(self):
        c = self.canv
        rows  = ['سبب الدخول في الصفقة','مستوى وقف الخسارة (SL)',
                 'هدف الربح (TP)','نتيجة الصفقة','الدرس المستفاد']
        row_h = 30; lw = self.width * 0.36
        # Header
        c.setFillColor(RED)
        c.roundRect(0, self.height-38, self.width, 38, 4, fill=1, stroke=0)
        c.setFont('Body', 13); c.setFillColor(white)
        c.drawCentredString(self.width/2, self.height-26, ar(f'مثال صفقة رقم  {self.number}'))
        for i, row in enumerate(rows):
            y = self.height - 38 - (i+1)*row_h
            c.setFillColor(HexColor('#F7F7F7') if i%2==0 else white)
            c.rect(0, y, self.width, row_h, fill=1, stroke=0)
            c.setStrokeColor(GRAY_LINE); c.setLineWidth(0.3)
            c.line(0, y, self.width, y)
            c.setFillColor(RED)
            c.rect(self.width-lw, y, lw, row_h, fill=1, stroke=0)
            c.setFont('Body', 9); c.setFillColor(white)
            c.drawCentredString(self.width-lw/2, y+10, ar(row))
            c.setFont('Body', 8); c.setFillColor(GRAY_LINE)
            c.drawString(12, y+11, '· · · · · · · · · · · · · · · · · · · · · · · ·')
        c.setStrokeColor(GRAY_LINE); c.setLineWidth(0.8)
        c.roundRect(0, 0, self.width, self.height, 4, fill=0, stroke=1)

    def wrap(self, aW, aH): return (self.width, self.height)


# ═══════════════════════════════════════════════════════
#   PAGE CALLBACKS
# ═══════════════════════════════════════════════════════

def _draw_diagonal_bg(c):
    """Diagonal line pattern — top-right quadrant like PIPS30."""
    c.saveState()
    c.setStrokeColor(HexColor('#E5E5E5'))
    c.setLineWidth(0.6)
    x0, y0 = PW * 0.45, PH * 0.45  # start region
    w_r = PW - x0; h_r = PH - y0
    gap = 11
    total = w_r + h_r
    n = int(total / gap) + 4
    for i in range(n):
        ox = i * gap
        x1 = x0 + ox; y1 = PH
        x2 = x0 + ox - h_r; y2 = y0
        # clamp
        if x1 > PW: x1 = PW
        if x2 > PW: x2 = PW
        if x2 < x0 - 5: continue
        c.line(x1, y1, x2, y2)
    c.restoreState()


def content_page(c, doc):
    """PIPS30-style content page."""
    # Diagonal line bg
    _draw_diagonal_bg(c)

    # ── Top-left (RTL: top-right) logo block ──
    block_size = 52
    bx = PW - MR - block_size
    by = PH - block_size - 10

    # Red square behind logo
    c.setFillColor(RED)
    c.rect(bx, by, block_size, block_size, fill=1, stroke=0)

    # Logo inside red square
    pad = 6
    c.drawImage(logo_ir(), bx+pad, by+pad,
                width=block_size-pad*2, height=block_size-pad*2,
                preserveAspectRatio=True, mask='auto')

    # ── Bottom footer ──
    footer_h = 38
    gray_h   = 20
    # Gray strip above footer
    c.setFillColor(GRAY_BG)
    c.rect(0, 0, PW, gray_h + footer_h, fill=1, stroke=0)
    # Dark red footer bar
    c.setFillColor(RED_DARK)
    c.rect(0, 0, PW, footer_h, fill=1, stroke=0)

    # Page number in footer
    if doc.page > 3:
        c.setFont('Latin', 10)
        c.setFillColor(white)
        c.drawCentredString(PW/2, footer_h/2 - 5, str(doc.page - 3))

    # Brand in footer right
    c.setFont('Latin', 8)
    c.setFillColor(Color(1,1,1,alpha=0.6))
    c.drawString(ML, 12, 'GLOREX')


def chapter_separator_page(c, doc):
    """PIPS30-style chapter intro page — dark red with angular shape."""
    # Full dark red bg
    c.setFillColor(RED_DARK)
    c.rect(0, 0, PW, PH, fill=1, stroke=0)

    # Right white diagonal block (geometric shape)
    c.setFillColor(white)
    path = c.beginPath()
    path.moveTo(PW * 0.52, PH)
    path.lineTo(PW, PH)
    path.lineTo(PW, 0)
    path.lineTo(PW * 0.72, 0)
    path.close()
    c.drawPath(path, fill=1, stroke=0)

    # Red diagonal shape overlay
    c.setFillColor(RED)
    path2 = c.beginPath()
    path2.moveTo(PW * 0.52, PH)
    path2.lineTo(PW * 0.65, PH)
    path2.lineTo(PW * 0.85, 0)
    path2.lineTo(PW * 0.72, 0)
    path2.close()
    c.drawPath(path2, fill=1, stroke=0)

    # Logo (white version) top-left
    pad = 8; lsz = 44
    c.setFillColor(Color(1,1,1,alpha=0.15))
    c.rect(ML-4, PH-lsz-14, lsz+8, lsz+8, fill=1, stroke=0)
    c.drawImage(logo_ir(), ML, PH-lsz-10,
                width=lsz, height=lsz,
                preserveAspectRatio=True, mask='auto')

    # Border frame
    c.setStrokeColor(Color(1,1,1,alpha=0.25))
    c.setLineWidth(1.5)
    c.roundRect(14, 14, PW-28, PH-28, 4, fill=0, stroke=1)


def cover_page(c, doc):
    """Cover: full-bleed bg image + red angled block + title."""
    # Try to load a cover image from images/cover.*
    cover_img = None
    for ext in ['jpg','jpeg','png']:
        p = os.path.join(IMAGES, f'cover.{ext}')
        if os.path.exists(p):
            cover_img = p; break

    if cover_img:
        c.drawImage(ImageReader(cover_img), 0, 0, PW, PH,
                    preserveAspectRatio=False, mask='auto')
        # Dark overlay
        c.setFillColor(Color(0, 0, 0, alpha=0.45))
        c.rect(0, 0, PW, PH, fill=1, stroke=0)
    else:
        # Fallback: dark red background
        c.setFillColor(RED_DARK)
        c.rect(0, 0, PW, PH, fill=1, stroke=0)
        # Diagonal pattern
        c.saveState()
        c.setStrokeColor(Color(1,1,1,alpha=0.04)); c.setLineWidth(1)
        for i in range(0, int(PW+PH), 18):
            c.line(i, PH, i-PH, 0)
        c.restoreState()

    # Angled red block — left side (like PIPS30)
    c.setFillColor(RED)
    path = c.beginPath()
    path.moveTo(0, PH*0.62)
    path.lineTo(PW*0.78, PH*0.62)
    path.lineTo(PW*0.65, PH*0.38)
    path.lineTo(0, PH*0.38)
    path.close()
    c.drawPath(path, fill=1, stroke=0)

    # Title on the red block — use Body for mixed Arabic+Latin safety
    c.setFont('Body', 36)
    c.setFillColor(white)
    t1 = ar(C.TITLE)
    c.drawCentredString(PW*0.35, PH*0.53, t1)

    # Subtitle below block
    c.setFont('Body', 14)
    c.setFillColor(HexColor('#FFCCCC'))
    c.drawCentredString(PW*0.35, PH*0.36, ar(C.SUBTITLE))

    # Logo bottom-left
    lsz = 80
    c.drawImage(logo_ir(), ML, MB,
                width=lsz, height=lsz,
                preserveAspectRatio=True, mask='auto')
    c.setFont('Latin', 13); c.setFillColor(white)
    c.drawString(ML + lsz + 8, MB + 28, C.AUTHOR)
    c.setFont('Latin', 9); c.setFillColor(HexColor('#FFAAAA'))
    c.drawString(ML + lsz + 8, MB + 12, C.YEAR)


def back_cover_page(c, doc):
    cover_img = None
    for ext in ['jpg','jpeg','png']:
        p = os.path.join(IMAGES, f'cover.{ext}')
        if os.path.exists(p): cover_img = p; break

    if cover_img:
        c.drawImage(ImageReader(cover_img), 0, 0, PW, PH,
                    preserveAspectRatio=False, mask='auto')
        c.setFillColor(Color(0,0,0,alpha=0.6))
        c.rect(0,0,PW,PH,fill=1,stroke=0)
    else:
        c.setFillColor(RED_DARK); c.rect(0,0,PW,PH,fill=1,stroke=0)

    # Red block for quote
    c.setFillColor(RED)
    c.roundRect(ML, PH/2-80, CW, 140, 6, fill=1, stroke=0)

    c.setFont('ArabicBold', 20); c.setFillColor(white)
    c.drawCentredString(PW/2, PH/2+28, ar(C.BACK_QUOTE[0]))
    c.drawCentredString(PW/2, PH/2+4, ar(C.BACK_QUOTE[1]))

    c.setFont('Latin', 13); c.setFillColor(HexColor('#FFAAAA'))
    c.drawCentredString(PW/2, PH/2-46, C.SOCIAL)

    # Logo
    lsz=90
    c.drawImage(logo_ir(), (PW-lsz)/2, PH-200,
                width=lsz, height=lsz,
                preserveAspectRatio=True, mask='auto')

    # Footer
    c.setFillColor(RED_DARK); c.rect(0,0,PW,46,fill=1,stroke=0)
    c.setFont('Body',9); c.setFillColor(Color(1,1,1,alpha=0.6))
    c.drawCentredString(PW/2, 16, ar('جميع الحقوق محفوظة') + f'  ©  {C.AUTHOR} {C.YEAR}')


# ═══════════════════════════════════════════════════════
#   CONTENT RENDERER
# ═══════════════════════════════════════════════════════

def _resolve(filename):
    if not filename: return None
    p = os.path.join(IMAGES, filename)
    return p if os.path.exists(p) else None

def render_content(items):
    out = []
    for item in items:
        t = item.get('type')
        if   t == 'h2':
            out.append(Paragraph(ar(item['text']), ST['h_sub']))
        elif t == 'body':
            out.append(Paragraph(ar(item['text']), ST['body']))
        elif t == 'bullet':
            out.append(Paragraph('●   ' + ar(item['text']), ST['bullet']))
        elif t == 'space':
            out.append(Spacer(1, 0.35*cm))
        elif t == 'image':
            fp  = _resolve(item.get('file',''))
            cap = item.get('caption','')
            h   = item.get('height', 190)
            out.append(Spacer(1, 0.25*cm))
            out.append(ChartBox(fp, caption=cap, height=h))
            out.append(Spacer(1, 0.2*cm))
        elif t == 'trade':
            out.append(TradeTable(item['number']))
            out.append(Spacer(1, 0.3*cm))
        elif t == 'checklist':
            check_data = []
            for i, chk in enumerate(item['items']):
                cell = Paragraph('✓   ' + ar(chk), ST['check'])
                check_data.append([cell])
            tbl = Table(check_data, colWidths=[CW])
            tbl.setStyle(TableStyle([
                ('ROWBACKGROUNDS', (0,0),(-1,-1), [HexColor('#F7F7F7'), white]),
                ('TOPPADDING',    (0,0),(-1,-1), 7),
                ('BOTTOMPADDING', (0,0),(-1,-1), 7),
                ('LEFTPADDING',   (0,0),(-1,-1), 14),
                ('RIGHTPADDING',  (0,0),(-1,-1), 14),
                ('BOX',      (0,0),(-1,-1), 0.8, RED),
                ('LINEBELOW',(0,0),(-1,-2), 0.3, GRAY_LINE),
            ]))
            out.append(tbl); out.append(Spacer(1, 0.3*cm))
        elif t == 'numbered':
            # Numbered box like PIPS30
            out.append(NumberBox(item['number'], item['text']))
            out.append(Spacer(1, 0.2*cm))
    return out


# ── TOC builder ───────────────────────────────────────────────────────────────
def build_toc():
    items = [
        Spacer(1, 0.4*cm),
        Paragraph(ar('فهرس المحتويات'), ST['toc_h']),
        Spacer(1, 0.3*cm),
    ]
    # Red underline
    class RedLine(Flowable):
        def draw(self):
            c = self.canv
            c.setFillColor(RED); c.rect(0,0,60,4,fill=1,stroke=0)
        def wrap(self,a,b): return (CW,12)
    items.append(RedLine())
    items.append(Spacer(1, 0.4*cm))

    for i, ch in enumerate(C.CHAPTERS):
        pg_num = str(4 + i)
        row = Table([[
            Paragraph(pg_num, ST['toc_pg']),
            Paragraph(
                ar('·'*40),
                ParagraphStyle('d', fontName='Body', fontSize=7,
                               textColor=GRAY_LINE, alignment=TA_CENTER)
            ),
            Paragraph(ar(f'الفصل {ch["num"]}  —  {ch["title"]}'), ST['toc_e']),
        ]], colWidths=[26, None, 310])
        row.setStyle(TableStyle([
            ('VALIGN',        (0,0),(-1,-1),'MIDDLE'),
            ('TOPPADDING',    (0,0),(-1,-1), 8),
            ('BOTTOMPADDING', (0,0),(-1,-1), 8),
            ('LEFTPADDING',   (0,0),(-1,-1), 0),
            ('RIGHTPADDING',  (0,0),(-1,-1), 0),
        ]))
        items.append(row)
        # Red dot accent
        if i < len(C.CHAPTERS)-1:
            class TinyLine(Flowable):
                def draw(self):
                    c = self.canv
                    c.setStrokeColor(GRAY_LINE); c.setLineWidth(0.4)
                    c.line(0,0,CW,0)
                def wrap(self,a,b): return (CW, 1)
            items.append(TinyLine())
    return items


# ── Main builder ──────────────────────────────────────────────────────────────
def build():
    print("🔨 Building PDF...")

    doc = BaseDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=ML, rightMargin=MR,
        topMargin=MT, bottomMargin=MB,
    )

    # Content frame accounts for footer height
    footer_total = 58  # gray strip + red bar
    cf = Frame(ML, footer_total, CW, PH - MT - footer_total,
               leftPadding=0, rightPadding=0, topPadding=8, bottomPadding=0)
    ff = Frame(0, 0, PW, PH,
               leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

    doc.addPageTemplates([
        PageTemplate(id='cover',   frames=[ff], onPage=cover_page),
        PageTemplate(id='chapter', frames=[ff], onPage=chapter_separator_page),
        PageTemplate(id='content', frames=[cf], onPage=content_page),
        PageTemplate(id='back',    frames=[ff], onPage=back_cover_page),
    ])

    story = []

    # ── Cover ──
    story += [NextPageTemplate('content'), PageBreak()]

    # ── Copyright page ──
    story += [
        Spacer(1, 7*cm),
        Paragraph(f'©  {C.AUTHOR} {C.YEAR}  —  جميع الحقوق محفوظة', ST['copy']),
        Spacer(1, 1*cm),
        Paragraph(ar(C.DISCLAIMER), ST['dis']),
        Spacer(1, 1*cm),
        Paragraph(ar(f'تصميم وإعداد: {C.AUTHOR}'), ST['copy']),
    ]

    # ── TOC ──
    story += build_toc()

    # ── Chapters ──
    for ch_idx, ch in enumerate(C.CHAPTERS, start=1):
        # Chapter separator page
        story.append(NextPageTemplate('chapter'))
        story.append(PageBreak())

        # Draw chapter info on the separator via a full-page flowable
        class ChSep(Flowable):
            def __init__(self, idx, num, title):
                super().__init__()
                self.idx = idx   # integer 1-9 for ghost numeral
                self.num = num   # Arabic ordinal e.g. "الأول"
                self.title = title
                self.width = PW; self.height = PH
            def draw(self):
                c = self.canv
                # Big ghost Latin numeral (very faint, decorative)
                c.setFont('LatinBold', 300)
                c.setFillColor(Color(1, 1, 1, alpha=0.05))
                c.drawCentredString(PW * 0.22, PH * 0.18, str(self.idx))
                # "CHAPTER" in Latin, then Arabic ordinal beside it
                c.setFont('Latin', 10)
                c.setFillColor(Color(1, 1, 1, alpha=0.55))
                c.drawString(ML, PH * 0.63, 'CHAPTER')
                c.setFont('ArabicBold', 10)
                c.setFillColor(Color(1, 1, 1, alpha=0.55))
                c.drawRightString(PW * 0.46, PH * 0.63, ar(self.num))
                # Red accent line
                c.setStrokeColor(RED)
                c.setLineWidth(3)
                c.line(ML, PH * 0.615, ML + 52, PH * 0.615)
                # Chapter title — use Body (Arial Unicode) for mixed Arabic+Latin support
                c.setFont('Body', 32)
                c.setFillColor(white)
                title_ar = ar(self.title)
                words = title_ar.split()
                if len(words) > 3:
                    mid = len(words) // 2
                    line1 = ' '.join(words[:mid])
                    line2 = ' '.join(words[mid:])
                    c.drawRightString(PW * 0.46, PH * 0.57, line1)
                    c.drawRightString(PW * 0.46, PH * 0.49, line2)
                else:
                    c.drawRightString(PW * 0.46, PH * 0.53, title_ar)
                # "الفصل X" subtitle in Arabic below title
                c.setFont('Body', 11)
                c.setFillColor(Color(1, 1, 1, alpha=0.5))
                c.drawRightString(PW * 0.46, PH * 0.44, ar(f'الفصل {self.num}'))
            def wrap(self, aW, aH): return (PW, PH)

        story.append(ChSep(ch_idx, ch['num'], ch['title']))

        # Content pages
        story.append(NextPageTemplate('content'))
        story.append(PageBreak())

        # Chapter title as big page heading
        story.append(Paragraph(ar(ch['title']), ST['h_page']))

        # Red underline accent
        class RedAccent(Flowable):
            def draw(self):
                c = self.canv
                c.setFillColor(RED)
                c.rect(CW-70, 0, 70, 5, fill=1, stroke=0)
            def wrap(self, a, b): return (CW, 14)
        story.append(RedAccent())
        story.append(Spacer(1, 0.4*cm))

        story += render_content(ch['content'])

    # ── Back cover ──
    # Spacer after PageBreak forces ReportLab to flush and render the back-cover page
    story += [NextPageTemplate('back'), PageBreak(), Spacer(1, 1)]

    doc.build(story)
    print(f'\n✅  PDF جاهز: {OUTPUT}')
    import subprocess
    subprocess.Popen(['open', OUTPUT])


if __name__ == '__main__':
    build()
