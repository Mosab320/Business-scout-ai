"""
PDF generation service abstraction.

Produces a simple, readable text-based PDF of a business plan using
reportlab when available; otherwise returns a plaintext fallback so the
"Export PDF" feature never hard-fails.
"""
import io


class PDFService:
    def business_plan_to_pdf_bytes(self, plan: dict) -> bytes:
        try:
            from reportlab.lib.pagesizes import LETTER
            from reportlab.pdfgen import canvas
        except ImportError:
            text = self._plan_to_text(plan)
            return text.encode("utf-8")

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=LETTER)
        width, height = LETTER
        y = height - 50

        def line(text: str, size: int = 10, gap: int = 16):
            nonlocal y
            if y < 50:
                c.showPage()
                y = height - 50
            c.setFont("Helvetica-Bold" if size > 10 else "Helvetica", size)
            c.drawString(50, y, text[:110])
            y -= gap

        line(plan.get("business_name", "Business Plan"), size=16, gap=26)
        for section_title, key in [
            ("Executive Summary", "executive_summary"),
            ("Business Concept", "business_concept"),
            ("Target Customer", "target_customer"),
            ("Pricing Strategy", "pricing_strategy"),
            ("Competitor Strategy", "competitor_strategy"),
            ("Marketing Strategy", "marketing_strategy"),
            ("Operations", "operations"),
        ]:
            line(section_title, size=13, gap=20)
            content = str(plan.get(key, ""))
            for chunk_start in range(0, len(content), 95):
                line(content[chunk_start : chunk_start + 95])
            y -= 6

        c.save()
        buffer.seek(0)
        return buffer.read()

    def _plan_to_text(self, plan: dict) -> str:
        lines = [plan.get("business_name", "Business Plan"), "=" * 40]
        for section_title, key in [
            ("Executive Summary", "executive_summary"),
            ("Business Concept", "business_concept"),
            ("Target Customer", "target_customer"),
            ("Pricing Strategy", "pricing_strategy"),
            ("Competitor Strategy", "competitor_strategy"),
            ("Marketing Strategy", "marketing_strategy"),
            ("Operations", "operations"),
        ]:
            lines.append(f"\n{section_title}\n" + "-" * len(section_title))
            lines.append(str(plan.get(key, "")))
        return "\n".join(lines)


pdf_service = PDFService()
