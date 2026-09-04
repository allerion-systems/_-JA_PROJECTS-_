"""Cross-section generator for the Metal Sales 5V-Crimp roof panel.

Verified against the manufacturer's published section:

    net coverage        24.00"      Metal Sales 5V-Crimp brochure (3-2026)
    overall formed w.   26-1/16"    SA Quality Metals 5V-Crimp data sheet
    rib height          0.50"       Metal Sales / MBCI / McElroy
    major rib spacing   12.00" o.c. SA Quality / MBCI / McElroy
    sidelap             DOUBLE V    Metal Sales UL 580 Const. #453 text

The name is literal: five V crimps per panel — a DOUBLE V at each side edge
(2 + 2) that forms the sidelap, plus a SINGLE V on the 12" centreline. Laid up,
the roof reads as a double V every 24" at the module joint and a single V
halfway between.

Fastener layout, quoted from Metal Sales UL 580 Construction #453:

    "a line of fasteners is to be installed, beginning from the center of the
     double V at the sidlap [sic] in 2-9-2-9 in. pattern for a total of four
     fasteners across the width of the panel. This fastener spacing to be
     3 feet on center along the length of the panel"

which places fasteners at 2", 11", 13" and 22" across each 24" module — a pair
flanking the sidelap and a pair flanking the centre V. Fasteners land in the
FLAT, never through a crimp.

UNVERIFIED: the centre-to-centre spread of the two V's inside the double V is
not published in any source found. It is parameterised below as
``double_v_spread`` and must be confirmed against a physical panel or the
manufacturer's shop drawing before this dimension is relied on.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Panel5V:
    coverage: float = 24.0          # net coverage, in.
    formed_width: float = 26.0625   # overall width before lap, in.
    rib_h: float = 0.50             # crimp height, in.
    rib_w: float = 0.75             # crimp width at the pan, in.  (UNVERIFIED)
    major_spacing: float = 12.0     # sidelap V to centre V, in.
    double_v_spread: float = 1.50   # c/c of the two V's at the lap (UNVERIFIED)

    # fastener stations across one 24" module, per UL 580 Const. #453
    fastener_pattern: tuple = (2.0, 11.0, 13.0, 22.0)

    verified_spacing: bool = True
    verified_double_v: bool = False
    source: str = ("Metal Sales 5V-Crimp brochure 3-2026; "
                   "UL 580 Construction #453 (detail manual P5V-5)")

    # ------------------------------------------------------------------
    def rib_centers(self, x0: float = 0.0, n_widths: int = 1) -> list[float]:
        """X positions of every crimp centreline across ``n_widths`` modules.

        A module boundary carries a double V (two crimps straddling it); the
        module centre carries a single V.
        """
        h = self.double_v_spread / 2.0
        cs: list[float] = []
        for w in range(n_widths + 1):
            b = x0 + w * self.coverage
            cs.extend([b - h, b + h])                       # double V at the lap
            if w < n_widths:
                cs.append(b + self.major_spacing)           # single centre V
        return sorted(cs)

    def section(self, x0: float = 0.0, n_widths: int = 1) -> list[tuple[float, float]]:
        """Panel cross-section polyline: (x across roof, z above the deck)."""
        half = self.rib_w / 2.0
        pts: list[tuple[float, float]] = []
        for c in self.rib_centers(x0, n_widths):
            pts.append((c - half, 0.0))
            pts.append((c, self.rib_h))
            pts.append((c + half, 0.0))
        out = [pts[0]]
        for p in pts[1:]:
            if abs(p[0] - out[-1][0]) > 1e-9 or abs(p[1] - out[-1][1]) > 1e-9:
                out.append(p)
        return out

    def fastener_stations(self, x0: float = 0.0, n_widths: int = 1) -> list[float]:
        return [x0 + w * self.coverage + f
                for w in range(n_widths) for f in self.fastener_pattern]

    # ------------------------------------------------------------------
    @property
    def clear_bay(self) -> float:
        """Clear flat pan between the sidelap double V and the centre V.

        This is the widest opening that fits in one bay without cutting a crimp,
        and therefore the governing constraint on a vent throat.
        """
        return self.major_spacing - self.double_v_spread / 2.0 - self.rib_w

    @property
    def lap_allowance(self) -> float:
        return self.formed_width - self.coverage

    def summary(self) -> dict:
        return {
            "net coverage": f'{self.coverage}"',
            "overall formed width": f'{self.formed_width}"',
            "lap allowance": f'{self.lap_allowance:.4f}"',
            "crimps per panel": len(self.rib_centers()) - 2,
            "major rib spacing": f'{self.major_spacing}" o.c.',
            "crimp height": f'{self.rib_h}"',
            "clear flat bay": f'{self.clear_bay:.3f}"',
            "fasteners across module": " / ".join(
                f'{f:g}"' for f in self.fastener_pattern),
            "spacing verified": self.verified_spacing,
            "double-V spread verified": self.verified_double_v,
        }


if __name__ == "__main__":
    p = Panel5V()
    for k, v in p.summary().items():
        print(f"{k:>26} : {v}")
    print("\n  rib centres (1 module):",
          ", ".join(f"{c:g}" for c in p.rib_centers()))
    print("  fastener stations     :",
          ", ".join(f"{c:g}" for c in p.fastener_stations()))
