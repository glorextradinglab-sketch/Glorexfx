#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GLOREX Trading Ebook — Professional Arabic RTL PDF
Clean minimal design, no excessive lines, logo on every page.
"""

import os
import arabic_reshaper
from bidi.algorithm import get_display

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Paragraph, Spacer, PageBreak, NextPageTemplate,
    Table, TableStyle, Flowable,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image

# ── Fonts ─────────────────────────────────────────────────────────────────────
# Arial Unicode: covers Arabic + Latin together (critical for mixed text)
FONT_BODY   = '/Library/Fonts/Arial Unicode.ttf'
# SFArabicRounded: used ONLY on red banners (Arabic-only canvas draws)
FONT_ARABIC = '/System/Library/Fonts/SFArabicRounded.ttf'
FONT_LATIN  = '/System/Library/Fonts/SFNS.ttf'

pdfmetrics.registerFont(TTFont('Body',        FONT_BODY))
pdfmetrics.registerFont(TTFont('ArabicBold',  FONT_ARABIC))
pdfmetrics.registerFont(TTFont('Latin',       FONT_LATIN))

# ── Colors ────────────────────────────────────────────────────────────────────
RED         = HexColor('#8B0000')
RED_DARK    = HexColor('#6B0000')
RED_LIGHT   = HexColor('#F9EDED')
GOLD        = HexColor('#C9A84C')
TEXT        = HexColor('#1A1A1A')
TEXT_MUTED  = HexColor('#666666')
PAGE_BG     = white

# ── Logo ──────────────────────────────────────────────────────────────────────
LOGO_PATH        = '/tmp/glorex_logo.png'          # transparent — for red cover/back
LOGO_REDBG_PATH  = '/tmp/glorex_logo_red_bg.png'   # red background — for white pages

# ── Page geometry ─────────────────────────────────────────────────────────────
PW, PH   = A4          # 595 × 842 pt
ML = MR  = 2.2 * cm
MT       = 2.6 * cm
MB       = 2.0 * cm
CW       = PW - ML - MR

OUTPUT = '/Users/ghaithalhabbal/طلبات/glorex_trading_ebook.pdf'

# ── Arabic text helper ────────────────────────────────────────────────────────
def ar(text):
    return get_display(arabic_reshaper.reshape(text))

# ── Styles ────────────────────────────────────────────────────────────────────
def S(name, **kw):
    defaults = dict(fontName='Body', wordWrap='RTL', alignment=TA_RIGHT,
                    textColor=TEXT, spaceAfter=4)
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

STYLES = {
    'body':    S('body',    fontSize=12, leading=24),
    'body_c':  S('body_c',  fontSize=12, leading=24, alignment=TA_CENTER),
    'h2':      S('h2',      fontSize=16, leading=28, textColor=RED,
                             spaceBefore=18, spaceAfter=8),
    'h3':      S('h3',      fontSize=13, leading=24, textColor=RED_DARK,
                             spaceBefore=12, spaceAfter=6),
    'bullet':  S('bullet',  fontSize=12, leading=24, rightIndent=10),
    'check':   S('check',   fontSize=12, leading=26, rightIndent=10),
    'caption': S('caption', fontSize=9,  leading=16, textColor=TEXT_MUTED,
                             alignment=TA_CENTER, spaceAfter=10),
    'copy':    S('copy',    fontSize=11, leading=22, textColor=TEXT_MUTED,
                             alignment=TA_CENTER, spaceAfter=6),
    'disclm':  S('disclm',  fontSize=10, leading=18, textColor=TEXT_MUTED),
    'toc_h':   S('toc_h',   fontSize=22, leading=34, textColor=RED,
                             spaceAfter=20),
    'toc_e':   S('toc_e',   fontSize=13, leading=26, textColor=TEXT),
    'toc_pg':  S('toc_pg',  fontSize=13, leading=26, textColor=RED,
                             alignment=TA_LEFT, fontName='Latin'),
}

# ── Logo readers (loaded once each) ──────────────────────────────────────────
_logo = None
_logo_redbg = None

def logo():
    global _logo
    if _logo is None:
        _logo = ImageReader(LOGO_PATH)
    return _logo

def logo_redbg():
    global _logo_redbg
    if _logo_redbg is None:
        _logo_redbg = ImageReader(LOGO_REDBG_PATH)
    return _logo_redbg

# ── Page callbacks ────────────────────────────────────────────────────────────

def _draw_watermark(c):
    c.saveState()
    c.translate(PW / 2, PH / 2)
    c.rotate(45)
    c.setFont('Latin', 90)
    c.setFillColor(Color(0.5, 0, 0, alpha=0.03))
    c.drawCentredString(0, 0, 'GLOREX')
    c.restoreState()

def content_page(c, doc):
    """Header: logo left + thin accent bar. Footer: page number only."""
    _draw_watermark(c)

    # ── Header ──
    logo_sz = 32
    logo_x  = PW - MR - logo_sz
    logo_y  = PH - MT + 3

    # Draw small red rounded rect behind logo so white bull is visible
    c.setFillColor(RED)
    c.roundRect(logo_x - 2, logo_y - 2, logo_sz + 4, logo_sz + 4, 4, fill=1, stroke=0)

    # Logo on red bg (transparent version over the red rect)
    lr = logo()
    c.drawImage(lr, logo_x, logo_y, width=logo_sz, height=logo_sz,
                preserveAspectRatio=True, mask='auto')

    # Brand name left
    c.setFont('Latin', 8)
    c.setFillColor(RED)
    c.drawString(ML, PH - MT + 14, 'GLOREX')

    # Thin gold accent line under header
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(ML, PH - MT + 2, PW - MR, PH - MT + 2)

    # ── Footer ──
    if doc.page > 3:
        c.setFont('Latin', 9)
        c.setFillColor(TEXT_MUTED)
        c.drawCentredString(PW / 2, MB - 14, str(doc.page - 3))


def cover_page(c, doc):
    """Full-bleed dark red cover."""
    # Background
    c.setFillColor(RED)
    c.rect(0, 0, PW, PH, fill=1, stroke=0)

    # Darker top band
    c.setFillColor(RED_DARK)
    c.rect(0, PH - 120, PW, 120, fill=1, stroke=0)

    # Logo — large, centered, top area
    lr = logo()
    lsz = 170
    c.drawImage(lr, (PW - lsz) / 2, PH - 310,
                width=lsz, height=lsz,
                preserveAspectRatio=True, mask='auto')

    # Thin gold separator
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.2)
    c.line(ML + 50, PH - 330, PW - MR - 50, PH - 330)

    # Title
    c.setFont('ArabicBold', 36)
    c.setFillColor(white)
    c.drawCentredString(PW / 2, PH - 390, ar('تداول كما يقول الكتاب'))

    # Subtitle
    c.setFont('Body', 16)
    c.setFillColor(HexColor('#FFCCCC'))
    c.drawCentredString(PW / 2, PH - 426, ar('دليلك الشامل من الصفر إلى الاحتراف'))

    # Gold separator
    c.setStrokeColor(GOLD)
    c.line(ML + 50, PH - 448, PW - MR - 50, PH - 448)

    # Author
    c.setFont('Latin', 15)
    c.setFillColor(GOLD)
    c.drawCentredString(PW / 2, PH - 476, 'GLOREX')

    # Bottom tagline
    c.setFont('Body', 9)
    c.setFillColor(HexColor('#AA4444'))
    c.drawCentredString(PW / 2, 36, ar('تداول بمعرفة  •  تداول بانضباط  •  تداول كما يقول الكتاب'))


def back_cover_page(c, doc):
    """Back cover — clean red with quote."""
    c.setFillColor(RED)
    c.rect(0, 0, PW, PH, fill=1, stroke=0)

    c.setFillColor(RED_DARK)
    c.rect(0, PH - 80, PW, 80, fill=1, stroke=0)
    c.rect(0, 0, PW, 80, fill=1, stroke=0)

    # Logo
    lr = logo()
    lsz = 120
    c.drawImage(lr, (PW - lsz) / 2, PH - 230,
                width=lsz, height=lsz,
                preserveAspectRatio=True, mask='auto')

    # Separator
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.line(ML + 70, PH - 250, PW - MR - 70, PH - 250)

    # Quote
    c.setFont('ArabicBold', 19)
    c.setFillColor(white)
    c.drawCentredString(PW / 2, PH / 2 + 20, ar('"السوق لا يكافئ الشجعان فقط،'))
    c.drawCentredString(PW / 2, PH / 2 - 10, ar('بل يكافئ المستعدين."'))

    c.setStrokeColor(GOLD)
    c.line(ML + 70, PH / 2 - 35, PW - MR - 70, PH / 2 - 35)

    # Social
    c.setFont('Latin', 15)
    c.setFillColor(GOLD)
    c.drawCentredString(PW / 2, PH / 2 - 72, '@GLOREX')

    # Copyright
    c.setFont('Body', 9)
    c.setFillColor(HexColor('#AA4444'))
    c.drawCentredString(PW / 2, 56, ar('جميع الحقوق محفوظة') + '  ©  GLOREX 2025')


# ── Custom Flowables ──────────────────────────────────────────────────────────

class ChapterBanner(Flowable):
    """Full-width chapter header — red banner, gold bottom accent."""
    def __init__(self, num_ar, title_ar, width=CW):
        super().__init__()
        self.num_ar  = num_ar
        self.title   = title_ar
        self.width   = width
        self.height  = 68

    def draw(self):
        c = self.canv
        # Banner background
        c.setFillColor(RED)
        c.roundRect(0, 0, self.width, self.height, 5, fill=1, stroke=0)
        # Gold bottom line
        c.setFillColor(GOLD)
        c.rect(0, 0, self.width, 3, fill=1, stroke=0)
        # Chapter label
        c.setFont('ArabicBold', 9)
        c.setFillColor(HexColor('#FFAAAA'))
        c.drawCentredString(self.width / 2, self.height - 17, ar(f'الفصل {self.num_ar}'))
        # Title
        c.setFont('ArabicBold', 21)
        c.setFillColor(white)
        c.drawCentredString(self.width / 2, self.height - 47, ar(self.title))

    def wrap(self, aW, aH):
        return (self.width, self.height)


class Divider(Flowable):
    """Minimal single-line section divider."""
    def __init__(self, color=HexColor('#E8D0D0'), width=CW, thickness=0.6):
        super().__init__()
        self.color     = color
        self.width     = width
        self.thickness = thickness
        self.height    = 16

    def draw(self):
        c = self.canv
        c.setStrokeColor(self.color)
        c.setLineWidth(self.thickness)
        c.line(0, self.height / 2, self.width, self.height / 2)

    def wrap(self, aW, aH):
        return (self.width, self.height)


class ChartBox(Flowable):
    """Clean placeholder for charts/screenshots."""
    def __init__(self, label_ar='', height=180, width=CW):
        super().__init__()
        self.label  = label_ar
        self.height = height
        self.width  = width

    def draw(self):
        c = self.canv
        # Subtle light background
        c.setFillColor(RED_LIGHT)
        c.setStrokeColor(HexColor('#D4AAAA'))
        c.setLineWidth(1)
        c.roundRect(0, 0, self.width, self.height, 6, fill=1, stroke=1)
        # Camera icon (simple lines)
        cx, cy = self.width / 2, self.height / 2 + 14
        r = 18
        c.setStrokeColor(HexColor('#C08080'))
        c.setFillColor(HexColor('#C08080'))
        c.setLineWidth(1.5)
        # Lens circle
        c.circle(cx, cy, r, fill=0, stroke=1)
        c.circle(cx, cy, r * 0.4, fill=1, stroke=0)
        # Body rect above
        c.setLineWidth(1)
        c.roundRect(cx - r * 1.5, cy - r * 0.5, r * 3, r * 2.4, 4, fill=0, stroke=1)
        # Add image label
        c.setFont('Body', 11)
        c.setFillColor(RED)
        label = ar('[ أضف الصورة هنا ]')
        c.drawCentredString(self.width / 2, 28, label)
        if self.label:
            c.setFont('Body', 9)
            c.setFillColor(TEXT_MUTED)
            c.drawCentredString(self.width / 2, 12, ar(self.label))

    def wrap(self, aW, aH):
        return (self.width, self.height)


class TradeExample(Flowable):
    """Structured trade breakdown table."""
    def __init__(self, number, width=CW):
        super().__init__()
        self.number = number
        self.width  = width
        self.height = 188

    def draw(self):
        c = self.canv
        rows = [
            'سبب الدخول في الصفقة',
            'مستوى وقف الخسارة  (SL)',
            'هدف الربح  (TP)',
            'نتيجة الصفقة',
            'الدرس المستفاد',
        ]
        row_h = 30
        label_w = self.width * 0.36

        # Header
        c.setFillColor(RED)
        c.roundRect(0, self.height - 38, self.width, 38, 5, fill=1, stroke=0)
        c.setFont('ArabicBold', 13)
        c.setFillColor(white)
        c.drawCentredString(self.width / 2, self.height - 26,
                             ar(f'مثال صفقة رقم  {self.number}'))

        for i, row in enumerate(rows):
            y = self.height - 38 - (i + 1) * row_h
            bg = RED_LIGHT if i % 2 == 0 else white
            c.setFillColor(bg)
            c.rect(0, y, self.width, row_h, fill=1, stroke=0)
            # Separator
            c.setStrokeColor(HexColor('#E0C0C0'))
            c.setLineWidth(0.4)
            c.line(0, y, self.width, y)
            # Label cell
            c.setFillColor(RED)
            c.rect(self.width - label_w, y, label_w, row_h, fill=1, stroke=0)
            c.setFont('ArabicBold', 9)
            c.setFillColor(white)
            c.drawCentredString(self.width - label_w / 2, y + 10, ar(row))
            # Dots in value area
            c.setFont('Body', 8)
            c.setFillColor(HexColor('#CCAAAA'))
            c.drawString(12, y + 11, '· · · · · · · · · · · · · · · · · · · · · · ·')

        # Outer border
        c.setStrokeColor(HexColor('#D4AAAA'))
        c.setLineWidth(0.8)
        c.roundRect(0, 0, self.width, self.height, 5, fill=0, stroke=1)

    def wrap(self, aW, aH):
        return (self.width, self.height)


# ── Shorthand helpers ─────────────────────────────────────────────────────────

def p(text, style='body'):
    return Paragraph(ar(text), STYLES[style])

def h2(text):
    return Paragraph(ar(text), STYLES['h2'])

def h3(text):
    return Paragraph(ar(text), STYLES['h3'])

def b(text):
    """Bullet point."""
    return Paragraph('●   ' + ar(text), STYLES['bullet'])

def sp(n=0.3):
    return Spacer(1, n * cm)

def chart(label='', h=175):
    return ChartBox(label_ar=label, height=h)

def chapter(num, title):
    return [PageBreak(), ChapterBanner(num, title), sp(0.5)]


# ── CONTENT BUILDERS ──────────────────────────────────────────────────────────

def build_cover():
    return [NextPageTemplate('content'), PageBreak()]


def build_copyright():
    return [
        sp(7),
        p('جميع الحقوق محفوظة  ©  GLOREX 2025', 'copy'),
        sp(1.2),
        Divider(GOLD),
        sp(0.6),
        p(
            'تنبيه هام: المعلومات الواردة في هذا الكتاب هي لأغراض تعليمية فقط ولا تُعدّ نصيحة '
            'مالية أو استثمارية. التداول في الأسواق المالية ينطوي على مخاطر عالية وقد يؤدي إلى '
            'خسارة رأس المال بالكامل. يُنصح بالتشاور مع مستشار مالي معتمد قبل البدء في التداول. '
            'الأداء السابق لا يضمن نتائج مستقبلية. تداول فقط بما يمكنك تحمّل خسارته.',
            'disclm'
        ),
        sp(0.6),
        Divider(GOLD),
        sp(1),
        p('الطبعة الأولى — 2025', 'copy'),
        p('تصميم وإعداد: GLOREX', 'copy'),
    ]


def build_toc():
    S = STYLES
    chapters = [
        ('١', 'مقدمة عن التداول'),
        ('٢', 'الاتجاه: روح السوق'),
        ('٣', 'العرض والطلب'),
        ('٤', 'تأكيد الدخول: Fair Value Gap'),
        ('٥', 'إدارة المخاطر: Risk to Reward'),
        ('٦', 'وقف الخسارة: Stop Loss'),
        ('٧', 'هدف الربح: Take Profit'),
        ('٨', 'دمج الإطارات الزمنية'),
        ('٩', 'أمثلة صفقات حقيقية'),
    ]
    items = [
        sp(0.4),
        Paragraph(ar('فهرس المحتويات'), S['toc_h']),
        Divider(GOLD),
        sp(0.3),
    ]
    for i, (num, title) in enumerate(chapters):
        row = Table(
            [[
                Paragraph(str(4 + i), S['toc_pg']),
                Paragraph(
                    ar('·' * 35),
                    ParagraphStyle('d', fontName='Body', fontSize=7,
                                   textColor=HexColor('#DDBBBB'), alignment=TA_CENTER)
                ),
                Paragraph(ar(f'الفصل {num}  —  {title}'), S['toc_e']),
            ]],
            colWidths=[28, None, 300],
        )
        row.setStyle(TableStyle([
            ('VALIGN',        (0,0),(-1,-1),'MIDDLE'),
            ('TOPPADDING',    (0,0),(-1,-1), 7),
            ('BOTTOMPADDING', (0,0),(-1,-1), 7),
            ('LEFTPADDING',   (0,0),(-1,-1), 0),
            ('RIGHTPADDING',  (0,0),(-1,-1), 0),
        ]))
        items.append(row)
        if i < len(chapters) - 1:
            items.append(Divider(HexColor('#F0E0E0'), thickness=0.4))
    return items


# ── CHAPTER 1 ─────────────────────────────────────────────────────────────────
def build_ch1():
    items = chapter('الأول', 'مقدمة عن التداول')
    items += [
        h2('ما هو التداول؟'),
        p(
            'التداول هو عملية شراء وبيع الأصول المالية بهدف تحقيق الربح من فرق السعر. '
            'يشمل ذلك الأسهم، العملات الأجنبية (Forex)، السلع كالذهب والنفط، '
            'والعقود الآجلة (Futures). التداول فنٌ وعلمٌ في آنٍ واحد — يتطلب '
            'فهمًا عميقًا للأسواق، وانضباطًا نفسيًا، وخطة واضحة لا تتزعزع.'
        ),
        sp(0.2),
        h2('الأسواق المالية'),
        b('سوق الأسهم: تداول حصص الملكية في الشركات المدرجة'),
        b('سوق الفوركس (Forex): تداول أزواج العملات الأجنبية'),
        b('سوق العقود الآجلة (Futures): تداول عقود مرتبطة بأصول مستقبلية'),
        b('سوق العملات الرقمية: بيتكوين وغيرها من الأصول الرقمية'),
        sp(0.2),
        h2('لماذا NQ / Nasdaq Futures؟'),
        p(
            'مؤشر Nasdaq 100 (NQ) يضم أكبر 100 شركة تكنولوجية في العالم '
            'كـ Apple وMicrosoft وAmazon. يتميز بالسيولة العالية والحركة الواضحة، '
            'يحترم مناطق العرض والطلب بشكل ممتاز، ويتداول تقريبًا على مدار الساعة.'
        ),
        b('السيولة العالية: دخول وخروج سلس دون تأثير كبير على السعر'),
        b('الحركة الواضحة: يحترم المناطق الفنية بدقة'),
        b('الفرص المتكررة: إعدادات قابلة للتكرار يوميًا'),
        sp(0.2),
        h2('لمن هذا الكتاب؟'),
        p(
            'هذا الكتاب موجه لكل من يريد تعلم التداول من الصفر، أو لمن جرّب '
            'وخسر دون أن يعرف السبب. لا تحتاج خبرة مسبقة — كل ما تحتاجه '
            'هو الرغبة الصادقة في التعلم والانضباط في التطبيق.'
        ),
        h2('كيف تستخدم هذا الكتاب؟'),
        b('اقرأ كل فصل بالترتيب ولا تتخطى الأساسيات'),
        b('طبّق كل مفهوم على حساب تجريبي (Demo) قبل رأس المال الحقيقي'),
        b('استخدم قائمة التحقق في الفصل الثامن قبل كل صفقة'),
        b('راجع أمثلة الصفقات في الفصل التاسع للتطبيق العملي'),
        sp(0.4),
        chart('منصة التداول — مثال على الواجهة', 155),
    ]
    return items


# ── CHAPTER 2 ─────────────────────────────────────────────────────────────────
def build_ch2():
    items = chapter('الثاني', 'الاتجاه: روح السوق')
    items += [
        h2('ما هو الاتجاه (Trend)؟'),
        p(
            'الاتجاه هو الإجابة على أهم سؤال في التداول: "أين يتحرك السوق؟" '
            'التداول مع الاتجاه هو الطريقة الأكثر أمانًا وربحية على المدى البعيد. '
            'المحترفون لا يقاومون الاتجاه — بل يركبونه.'
        ),
        sp(0.2),
        h2('الاتجاه الصاعد — Higher Highs & Higher Lows'),
        p(
            'الاتجاه الصاعد هو سلسلة من القمم المرتفعة (HH) والقيعان المرتفعة (HL). '
            'كل قمة جديدة تكون أعلى من السابقة، وكل قاع جديد أعلى من القاع قبله. '
            'قاعدة: لا تبحث عن صفقات شراء إلا في الاتجاه الصاعد الواضح.'
        ),
        b('HH (Higher High): قمة جديدة أعلى من القمة السابقة'),
        b('HL (Higher Low): قاع جديد أعلى من القاع السابق'),
        sp(0.3),
        chart('مخطط: HH / HL — الاتجاه الصاعد', 165),
        sp(0.4),
        h2('الاتجاه الهابط — Lower Highs & Lower Lows'),
        p(
            'الاتجاه الهابط هو سلسلة من القمم المنخفضة (LH) والقيعان المنخفضة (LL). '
            'كل قمة جديدة تكون أدنى من السابقة، وكل قاع جديد أدنى من القاع قبله. '
            'قاعدة: لا تبحث عن صفقات بيع إلا في الاتجاه الهابط الواضح.'
        ),
        b('LH (Lower High): قمة جديدة أدنى من القمة السابقة'),
        b('LL (Lower Low): قاع جديد أدنى من القاع السابق'),
        sp(0.3),
        chart('مخطط: LH / LL — الاتجاه الهابط', 165),
        sp(0.4),
        h2('قاعدة محاذاة الإطارات الزمنية'),
        p(
            'يجب أن يتوافق الاتجاه على إطارين زمنيين على الأقل قبل الدخول. '
            'اليومي + H4 = إشارة قوية. توافق ثلاثة إطارات = إشارة ممتازة. '
            'تعارض الإطارات = انتظر ولا تدخل السوق.'
        ),
        b('الإطار اليومي (Daily): يُحدد الاتجاه الرئيسي للأسبوع'),
        b('إطار 4 ساعات (H4): يُحدد الاتجاه الوسيط للأيام القادمة'),
        b('إطار ساعة (H1): يُحدد الاتجاه قصير المدى للجلسة الحالية'),
    ]
    return items


# ── CHAPTER 3 ─────────────────────────────────────────────────────────────────
def build_ch3():
    items = chapter('الثالث', 'العرض والطلب')
    items += [
        h2('ما هي مناطق العرض والطلب؟'),
        p(
            'مناطق العرض والطلب هي أماكن على الرسم البياني حيث تجمّع الكبار '
            '(المؤسسات والبنوك) أوامر ضخمة للشراء أو البيع. عندما يعود السعر '
            'إلى هذه المناطق تُفعَّل هذه الأوامر مجددًا مما يُسبب حركة قوية. '
            'مهمتنا هي تحديد هذه المناطق والتداول معها وليس ضدها.'
        ),
        sp(0.2),
        h2('كيف تحدد الشمعة الأساسية (Base Candle)؟'),
        p(
            'الشمعة الأساسية هي آخر شمعة قبل الحركة القوية — '
            'هي الشمعة التي تركت فيها المؤسسات أوامرها المعلقة.'
        ),
        b('ابحث عن حركة قوية وسريعة (Impulse Move)'),
        b('اذهب للخلف وابحث عن آخر شمعة قبل بداية هذه الحركة'),
        b('جسم هذه الشمعة كاملًا هو منطقة العرض أو الطلب'),
        sp(0.3),
        chart('مثال: منطقة الطلب في الاتجاه الصاعد', 165),
        sp(0.4),
        h2('منطقة الطلب (Demand Zone)'),
        p(
            'في الاتجاه الصاعد نبحث عن مناطق الطلب لنشتري عندها. '
            'تتشكل من آخر شمعة حمراء قبل الدفعة الصاعدة القوية. '
            'كلما كانت الحركة بعدها أقوى وأبعد، كلما كانت المنطقة أهم وأقوى.'
        ),
        h2('منطقة العرض (Supply Zone)'),
        p(
            'في الاتجاه الهابط نبحث عن مناطق العرض لنبيع عندها. '
            'تتشكل من آخر شمعة خضراء قبل الدفعة الهبوطية القوية.'
        ),
        sp(0.3),
        chart('مثال: منطقة العرض في الاتجاه الهابط', 165),
        sp(0.4),
        h2('المناطق القوية مقابل الضعيفة'),
        b('القوية: تشكّلت لأول مرة ولم يختبرها السعر بعد'),
        b('القوية: الحركة بعدها كانت سريعة وبعيدة المدى (Impulse)'),
        b('الضعيفة: اختُبرت مرات عديدة — كلما اختُبرت أكثر، ضعُفت'),
        b('الإطار اليومي > H4 > H1 > 30 دقيقة من حيث الأهمية'),
    ]
    return items


# ── CHAPTER 4 ─────────────────────────────────────────────────────────────────
def build_ch4():
    items = chapter('الرابع', 'تأكيد الدخول: Fair Value Gap')
    items += [
        h2('ما هو الـ FVG؟'),
        p(
            'الـ FVG أو Fair Value Gap هو فجوة سعرية تحدث عندما تتحرك شمعة '
            'بقوة كبيرة تجعل الشمعة الأولى والثالثة لا تتداخل. '
            'هذه الفجوة تُمثل منطقة عدم توازن والسوق يميل دائمًا للعودة لملئها '
            'قبل الاستمرار في اتجاهه. نستخدمه كمؤكد للدخول لا كسبب للدخول.'
        ),
        sp(0.2),
        h2('كيف تُحدد الـ FVG؟'),
        p('يتكون الـ FVG من ثلاث شموع:'),
        b('الشمعة الأولى: تترك ظلاً علويًا أو سفليًا'),
        b('الشمعة الثانية: حركة قوية وهي سبب الفجوة'),
        b('الشمعة الثالثة: ظلها لا يتداخل مع ظل الشمعة الأولى'),
        p('المنطقة بين ظل الشمعة الأولى وظل الشمعة الثالثة هي منطقة الـ FVG.'),
        sp(0.2),
        h2('FVG الصاعد و FVG الهابط'),
        p(
            'الـ FVG الصاعد يتشكل خلال حركة صاعدة قوية — عندما يعود السعر '
            'إلى الفجوة من الأسفل نتوقع ارتداداً صاعداً. '
            'الـ FVG الهابط يتشكل خلال حركة هبوطية — عندما يعود السعر '
            'من الأعلى نتوقع ارتداداً هبوطياً.'
        ),
        sp(0.2),
        h2('خطوات الدخول باستخدام FVG'),
        b('١. حدد الاتجاه على Daily و H4'),
        b('٢. ابحث عن منطقة طلب (أو عرض) قوية في اتجاه السوق'),
        b('٣. انتظر وصول السعر إلى المنطقة'),
        b('٤. انزل إلى الإطار الدقيقي (1 دقيقة أو 5 دقائق)'),
        b('٥. ابحث عن FVG في اتجاه صفقتك داخل المنطقة'),
        b('٦. ادخل عند عودة السعر إلى الـ FVG'),
        sp(0.3),
        chart('مخطط: FVG على إطار 1 دقيقة كمؤكد للدخول', 185),
    ]
    return items


# ── CHAPTER 5 ─────────────────────────────────────────────────────────────────
def build_ch5():
    items = chapter('الخامس', 'إدارة المخاطر: Risk to Reward')
    items += [
        h2('ما هو Risk to Reward؟'),
        p(
            'نسبة المخاطرة للعائد (RR) هي المقارنة بين ما يمكنك خسارته '
            'وما يمكنك كسبه في صفقة واحدة. '
            'إذا كنت تخاطر بـ 100 دولار لتربح 200 دولار، فنسبة RR هي 1:2. '
            'هذه النسبة هي ما يجعل التداول مربحًا حتى لو خسرت أكثر مما ربحت.'
        ),
        sp(0.2),
        h2('لماذا الحد الأدنى 1:2 RR؟'),
        p('مثال عملي بـ 10 صفقات ونسبة فوز 40% فقط:'),
        b('مع 1:2 RR → 4 رابحة × 200 = 800 دولار | 6 خاسرة × 100 = 600 → ربح 200'),
        b('مع 1:1 RR → 4 رابحة × 100 = 400 دولار | 6 خاسرة × 100 = 600 → خسارة 200'),
        p(
            'الخلاصة: نسبة RR الصحيحة تُحوّل التداول من مقامرة إلى عمل تجاري منظم.'
        ),
        sp(0.2),
        h2('قاعدة الـ 5% — إدارة رأس المال'),
        p(
            'لا تخاطر أبدًا بأكثر من 5% من رأس مالك في صفقة واحدة. '
            'هذه القاعدة تحميك من الانهيار حتى لو خسرت عدة صفقات متتالية.'
        ),
        b('رأس المال 1,000 دولار  →  أقصى مخاطرة = 50 دولار / صفقة'),
        b('رأس المال 5,000 دولار  →  أقصى مخاطرة = 250 دولار / صفقة'),
        b('رأس المال 10,000 دولار →  أقصى مخاطرة = 500 دولار / صفقة'),
        sp(0.2),
        h2('كيف تحسب حجم المركز؟'),
        b('١. حدد نقطة وقف الخسارة (SL) بالدولار'),
        b('٢. احسب 5% من رأس مالك = الحد الأقصى للمخاطرة'),
        b('٣. حجم المركز = الحد الأقصى ÷ قيمة SL بالعقد الواحد'),
        p(
            'مثال: رأس المال 10,000 دولار — SL = 50 دولار / عقد → '
            'المخاطرة = 500 دولار → حجم المركز = 500 ÷ 50 = 10 عقود.'
        ),
    ]
    return items


# ── CHAPTER 6 ─────────────────────────────────────────────────────────────────
def build_ch6():
    items = chapter('السادس', 'وقف الخسارة: Stop Loss')
    items += [
        h2('لماذا وقف الخسارة غير قابل للنقاش؟'),
        p(
            'وقف الخسارة (Stop Loss) هو الأمر الذي يُغلق صفقتك تلقائيًا '
            'إذا تحرك السعر ضدك. إنه درعك الواقي من الكوارث. '
            'المتداولون المبتدئون يتجنبونه ظنًا أن السعر سيعود — '
            'وهذا الخطأ هو السبب الأول في تدمير الحسابات.'
        ),
        sp(0.2),
        h2('أين تضع وقف الخسارة؟'),
        b('صفقات الشراء: ضع SL أسفل منطقة الطلب مباشرةً + هامش 5-10 نقاط'),
        b('صفقات البيع: ضع SL أعلى منطقة العرض مباشرةً + هامش 5-10 نقاط'),
        p(
            'المنطق: إذا كسر السعر المنطقة، فتحليلك كان خاطئًا — '
            'الخروج هو الخيار الأذكى في هذه الحالة.'
        ),
        sp(0.2),
        h2('اصطياد وقف الخسارة — Liquidity Sweeps'),
        p(
            'الكبار يحركون السعر لمناطق تتراكم فيها أوامر وقف الخسارة، '
            'يُفعّلونها لجمع السيولة، ثم يعكسون الاتجاه. '
            'بعبارة أبسط: السوق يصطاد الضعفاء ثم يمشي في اتجاهه الحقيقي.'
        ),
        h2('كيف تتجنب اصطياد الوقف؟'),
        b('ضع SL أسفل القاع الأخير وليس أسفل المنطقة مباشرةً'),
        b('انتظر إغلاق الشمعة كاملاً قبل الدخول'),
        b('استخدم FVG كنقطة دخول لتكون داخل المنطقة لا على حافتها'),
        b('إذا رأيت Sweep ثم ارتداد قوي — هذه غالبًا فرصة ممتازة'),
        sp(0.3),
        chart('مخطط: وضع SL واصطياد السيولة', 175),
    ]
    return items


# ── CHAPTER 7 ─────────────────────────────────────────────────────────────────
def build_ch7():
    items = chapter('السابع', 'هدف الربح: Take Profit')
    items += [
        h2('أين تضع هدف الربح؟'),
        p(
            'هدف الربح (Take Profit) هو المستوى الذي ستُغلق عنده صفقتك '
            'وتجمع أرباحك. القاعدة: لا يجوز أن يكون TP أقل من ضعف المخاطرة (1:2 كحد أدنى).'
        ),
        sp(0.2),
        h2('TP عند مناطق العرض والطلب'),
        b('في الاتجاه الصاعد: ضع TP عند أقرب منطقة عرض فوق سعر الدخول'),
        b('في الاتجاه الهابط: ضع TP عند أقرب منطقة طلب تحت سعر الدخول'),
        b('تأكد أن المسافة إلى TP ≥ ضعف المسافة إلى SL'),
        sp(0.2),
        h2('استراتيجية الأخذ الجزئي للأرباح'),
        p('بدلًا من إغلاق الصفقة كلها دفعة واحدة:'),
        b('عند 1:1 RR — أغلق 50% من المركز وحرّك SL إلى نقطة التعادل'),
        b('عند 1:2 RR — أغلق 30% إضافية مع SL متحرك'),
        b('اترك 20% "تجري" مع الاتجاه للحصول على أرباح كبيرة'),
        p(
            'هذه الاستراتيجية تضمن ربحًا حتى لو ارتد السعر قبل الهدف الكامل، '
            'وتُريح نفسيتك وتُخفف ضغط التداول.'
        ),
        h2('أخطاء شائعة في التعامل مع TP'),
        b('إغلاق الصفقة مبكرًا خوفًا — ثق في تحليلك'),
        b('تحريك TP بعيدًا بجشع — التزم بهدفك الأصلي'),
        b('تجاهل نسبة RR — لا تدخل بـ TP أقل من 2× المخاطرة'),
        sp(0.3),
        chart('مخطط: وضع TP عند منطقة العرض القادمة', 175),
    ]
    return items


# ── CHAPTER 8 ─────────────────────────────────────────────────────────────────
def build_ch8():
    items = chapter('الثامن', 'دمج الإطارات الزمنية')
    items += [
        h2('التحليل من الأعلى إلى الأسفل'),
        p(
            'ابدأ دائمًا من الإطارات الكبيرة لتحديد الاتجاه، '
            'ثم انزل تدريجيًا للإطارات الأصغر للعثور على نقطة الدخول. '
            'الإطار الأكبر يُقرر الاتجاه — الإطار الأصغر يُقرر التوقيت.'
        ),
        sp(0.2),
        h2('التسلسل الزمني الكامل'),
        b('الشهري (Monthly): الصورة العامة الكبيرة'),
        b('الأسبوعي (Weekly): الاتجاه الرئيسي'),
        b('اليومي (Daily): من أين نشتري أو نبيع؟'),
        b('4 ساعات (H4): تأكيد الاتجاه'),
        b('ساعة (H1): البحث عن مناطق الدخول'),
        b('30 دقيقة: تأكيد إضافي عند الحاجة'),
        b('1 دقيقة: نقطة الدخول الدقيقة مع FVG'),
        sp(0.3),
        h2('قائمة التحقق الكاملة قبل كل صفقة'),
        p('أجب بـ "نعم" على جميع النقاط — أو لا تدخل:'),
        sp(0.15),
    ]

    checks = [
        'الاتجاه اليومي صاعد أو هابط بوضوح؟',
        'H4 يؤكد نفس الاتجاه؟',
        'H1 يؤكد نفس الاتجاه؟',
        'السعر عند منطقة طلب أو عرض قوية؟',
        'FVG واضح على الإطار الدقيقي؟',
        'المخاطرة ≤ 5% من رأس المال؟',
        'SL موضوع أسفل المنطقة (أو أعلاها في البيع)؟',
        'TP بنسبة 1:2 على الأقل من المخاطرة؟',
    ]

    check_data = []
    for i, chk in enumerate(checks):
        bg = RED_LIGHT if i % 2 == 0 else white
        cell = Paragraph('✓   ' + ar(chk), STYLES['check'])
        check_data.append([cell])

    tbl = Table(check_data, colWidths=[CW])
    tbl.setStyle(TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [RED_LIGHT, white]),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ('RIGHTPADDING',  (0,0), (-1,-1), 14),
        ('BOX',   (0,0), (-1,-1), 0.6, HexColor('#D4AAAA')),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, HexColor('#E8D0D0')),
    ]))
    items.append(tbl)
    items += [
        sp(0.4),
        p(
            'إذا لم تستطع الإجابة بـ "نعم" على جميع النقاط — '
            'لا تدخل. انتظر إعدادًا أفضل. '
            'الصبر في التداول لا يقل أهمية عن المعرفة.'
        ),
        sp(0.3),
        chart('مثال: تحليل متعدد الإطارات لصفقة كاملة', 185),
    ]
    return items


# ── CHAPTER 9 ─────────────────────────────────────────────────────────────────
def build_ch9():
    items = chapter('التاسع', 'أمثلة صفقات حقيقية')
    items += [
        p(
            'في هذا الفصل ستجد أمثلة على صفقات حقيقية تطبّق فيها كل ما تعلمناه. '
            'أضف صور الرسوم البيانية الخاصة بك في الأماكن المخصصة، '
            'وامل الجدول بتفاصيل كل صفقة لبناء سجل تداول احترافي.'
        ),
        sp(0.5),
        TradeExample('١'),
        sp(0.3),
        chart('الرسم البياني لمثال الصفقة الأولى', 155),
        sp(0.5),
        TradeExample('٢'),
        sp(0.3),
        chart('الرسم البياني لمثال الصفقة الثانية', 155),
        sp(0.5),
        TradeExample('٣'),
        sp(0.3),
        chart('الرسم البياني لمثال الصفقة الثالثة', 155),
        sp(0.5),
        Divider(GOLD),
        sp(0.4),
        h2('ملاحظة ختامية'),
        p(
            'التداول رحلة وليس وجهة. سجّل كل صفقاتك، راجع أخطاءك، '
            'واستمر في التعلم. الفارق الوحيد بين المتداول الرابح والخاسر '
            'هو الانضباط والصبر والالتزام بالخطة.'
        ),
        p('تداول كما يقول الكتاب — ليس كما تقول المشاعر.', 'body_c'),
    ]
    return items


def build_back_cover():
    return [NextPageTemplate('back'), PageBreak()]


# ── Build document ────────────────────────────────────────────────────────────
def build():
    doc = BaseDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=ML, rightMargin=MR,
        topMargin=MT, bottomMargin=MB,
    )

    content_frame = Frame(ML, MB, CW, PH - MT - MB,
                          leftPadding=0, rightPadding=0,
                          topPadding=0, bottomPadding=0)
    full_frame    = Frame(0, 0, PW, PH,
                          leftPadding=0, rightPadding=0,
                          topPadding=0, bottomPadding=0)

    doc.addPageTemplates([
        PageTemplate(id='cover',   frames=[full_frame],    onPage=cover_page),
        PageTemplate(id='content', frames=[content_frame], onPage=content_page),
        PageTemplate(id='back',    frames=[full_frame],    onPage=back_cover_page),
    ])

    story = []
    story += build_cover()
    story += build_copyright()
    story += build_toc()
    story += build_ch1()
    story += build_ch2()
    story += build_ch3()
    story += build_ch4()
    story += build_ch5()
    story += build_ch6()
    story += build_ch7()
    story += build_ch8()
    story += build_ch9()
    story += build_back_cover()

    doc.build(story)
    print(f'✓ PDF saved → {OUTPUT}')


if __name__ == '__main__':
    build()
