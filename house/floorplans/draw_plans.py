#!/usr/bin/env python3
"""Draw the four basement partition options as to-scale architectural floor plans.

Room: 11' x 22' interior (132 x 264 in). South (bottom) = stairs side.
West wall has the existing 3'-0" opening at Y36-72 (two steps off the stairs).
East wall has two 24"x12" hopper windows at the ceiling: Y24-48 and Y216-240.
Context (corridor, stairs, laundry, storage) is existing and untouched.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Arc

OUT = os.path.dirname(os.path.abspath(__file__))

PAPER  = "#f8f5ee"
INK    = "#20242a"   # existing walls
AMBER  = "#c99548"   # new 2x4 + paneling walls
AMBER_E= "#7a5320"
WINBLU = "#4f7ea6"
FURN_F = "#e9e2d2"
FURN_E = "#8f8878"
CTX_E  = "#8f8b80"
DIMC   = "#6b675e"
CURT   = "#7d5f9e"   # curtain squiggles
STAMP  = "#c8451f"

W, L = 132, 264          # clear interior
XW0, XW1 = -8, 0         # west existing wall
XE0, XE1 = 132, 140      # east existing wall


def ftin(inches):
    f, i = int(inches) // 12, int(inches) % 12
    return f"{f}'-{i}\""


def new_ax():
    fig = plt.figure(figsize=(9.8, 14.0), facecolor=PAPER)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor(PAPER)
    ax.set_xlim(-152, 172)
    ax.set_ylim(-152, 310)
    ax.set_aspect("equal")
    ax.axis("off")
    return fig, ax


def wall(ax, x, y, w, h, new=False):
    if new:
        ax.add_patch(Rectangle((x, y), w, h, fc=AMBER, ec=AMBER_E, lw=0.9, zorder=5))
    else:
        ax.add_patch(Rectangle((x, y), w, h, fc=INK, ec=INK, lw=0.5, zorder=4))


def squiggle(ax, x0, y0, x1, y1):
    """Curtain symbol: a small sine wave across an opening."""
    t = np.linspace(0, 1, 60)
    dx, dy = x1 - x0, y1 - y0
    ln = max(abs(dx), abs(dy))
    amp = 2.4
    wave = amp * np.sin(t * np.pi * ln / 6.0)
    if abs(dx) >= abs(dy):  # horizontal
        ax.plot(x0 + t * dx, y0 + wave, color=CURT, lw=1.4, zorder=7)
    else:
        ax.plot(x0 + wave, y0 + t * dy, color=CURT, lw=1.4, zorder=7)


def door_swing(ax, hx, hy, r, t0, t1, leaf_deg):
    """Dashed future-door swing: hinge at (hx,hy), radius r, arc t0..t1 deg."""
    ax.add_patch(Arc((hx, hy), 2 * r, 2 * r, angle=0, theta1=t0, theta2=t1,
                     ec=DIMC, lw=0.9, ls=(0, (3, 3)), zorder=6))
    a = np.deg2rad(leaf_deg)
    ax.plot([hx, hx + r * np.cos(a)], [hy, hy + r * np.sin(a)],
            color=DIMC, lw=0.9, ls=(0, (3, 3)), zorder=6)


def window(ax, y0, y1):
    ax.add_patch(Rectangle((XE0 - 1, y0), (XE1 - XE0) + 2, y1 - y0, fc=PAPER, ec="none", zorder=5))
    for xx in (XE0 + 1.5, XE0 + 4, XE0 + 6.5):
        ax.plot([xx, xx], [y0, y1], color=WINBLU, lw=1.1, zorder=6)
    ax.plot([XE0 - 1, XE1 + 1], [y0, y0], color=WINBLU, lw=0.8, zorder=6)
    ax.plot([XE0 - 1, XE1 + 1], [y1, y1], color=WINBLU, lw=0.8, zorder=6)
    ax.text(XE1 + 5, (y0 + y1) / 2, 'HOPPER 24"x12"\n@ CEILING', fontsize=6.4,
            family="monospace", color=WINBLU, va="center", ha="left")


def dim_v(ax, x, y0, y1, label, side=1):
    tick = 3
    ax.plot([x, x], [y0, y1], color=DIMC, lw=0.8, zorder=8)
    for yy in (y0, y1):
        ax.plot([x - tick, x + tick], [yy - tick, yy + tick], color=DIMC, lw=0.8, zorder=8)
    ax.text(x + 4.5 * side, (y0 + y1) / 2, label, fontsize=7.6, family="monospace",
            color=INK, rotation=90, va="center",
            ha="left" if side > 0 else "right", zorder=8)


def dim_h(ax, y, x0, x1, label, above=True):
    tick = 3
    ax.plot([x0, x1], [y, y], color=DIMC, lw=0.8, zorder=8)
    for xx in (x0, x1):
        ax.plot([xx - tick, xx + tick], [y - tick, y + tick], color=DIMC, lw=0.8, zorder=8)
    ax.text((x0 + x1) / 2, y + (4 if above else -4), label, fontsize=7.6,
            family="monospace", color=INK, ha="center",
            va="bottom" if above else "top", zorder=8)


def pillows(ax, by, x=114):
    """Two pillows at the head end of a 60-tall queen starting at y=by."""
    for dy in (6, 32):
        ax.add_patch(Rectangle((x, by + dy), 14, 22, fc="#f6f1e4", ec=FURN_E, lw=0.7, zorder=4))


def nightstand(ax, x, y):
    """Small 16x15 nightstand."""
    ax.add_patch(Rectangle((x, y), 16, 15, fc="#efe9da", ec=FURN_E, lw=0.8, zorder=4))
    ax.text(x + 8, y + 7.5, "NS", fontsize=5.2, family="monospace", color="#6d675b",
            ha="center", va="center", zorder=4)


def furn(ax, x, y, w, h, label, rot=0, dashed=False):
    ax.add_patch(Rectangle((x, y), w, h, fc=FURN_F, ec=FURN_E, lw=1.0,
                           ls=(0, (2, 2)) if dashed else "solid", zorder=3))
    ax.text(x + w / 2, y + h / 2, label, fontsize=6.8, family="monospace",
            color="#6d675b", ha="center", va="center", rotation=rot, zorder=3)


def room_label(ax, x, y, name, sub):
    ax.text(x, y + 7, name, fontsize=12.5, family="monospace", weight="bold",
            color=INK, ha="center", va="center", zorder=9)
    ax.text(x, y - 6, sub, fontsize=7.2, family="monospace",
            color=DIMC, ha="center", va="center", zorder=9)


def shell_and_context(ax):
    # existing perimeter (8" poured)
    wall(ax, XW0, -8, 8, 44 + 8)          # west, south of opening (Y-8..36)
    wall(ax, XW0, 72, 8, 200)             # west, north of opening (Y72..272)
    wall(ax, -8, -8, 156, 8)              # south
    wall(ax, -8, 264, 156, 8)             # north
    wall(ax, XE0, -8, 8, 280)             # east
    # the 3' entry opening (existing)
    squiggle(ax, -4, 38, -4, 70)
    ax.annotate("", xy=(24, 54), xytext=(-34, 54),
                arrowprops=dict(arrowstyle="-|>", color=STAMP, lw=1.6), zorder=9)
    ax.text(-44, 50, "IN", fontsize=8, family="monospace", weight="bold", color=STAMP)
    ax.text(-14, 100, 'EXISTING 3\'-0" OPENING', fontsize=6.4, family="monospace",
            color=DIMC, rotation=90, va="center", ha="center")
    # windows
    window(ax, 24, 48)
    window(ax, 216, 240)
    # corridor + stairs
    ax.add_patch(Rectangle((-48, -88), 40, 278, fc="#b9b5aa", alpha=0.16,
                           ec=CTX_E, lw=0.8, ls=(0, (4, 3)), zorder=1))
    for i in range(8):
        yy = -82 + i * 9
        ax.plot([-48, -8], [yy, yy], color=CTX_E, lw=0.8, zorder=2)
    ax.annotate("", xy=(-28, 20), xytext=(-28, -72),
                arrowprops=dict(arrowstyle="-|>", color=CTX_E, lw=1.2), zorder=2)
    ax.text(-58, -45, "STAIRS DN", fontsize=7, family="monospace", color=CTX_E,
            rotation=90, va="center", ha="center")
    ax.text(-40, 155, "CORRIDOR", fontsize=7, family="monospace", color=CTX_E,
            rotation=90, va="center", ha="center")
    # laundry
    ax.add_patch(Rectangle((-130, 40), 82, 130, fc="#b9b5aa", alpha=0.16,
                           ec=CTX_E, lw=0.8, ls=(0, (4, 3)), zorder=1))
    furn(ax, -75, 143, 27, 27, "W")
    furn(ax, -102, 143, 27, 27, "D")
    ax.text(-89, 95, "LAUNDRY\n(existing)", fontsize=7, family="monospace",
            color=CTX_E, ha="center", va="center")
    squiggle(ax, -48, 60, -48, 88)  # laundry door off corridor (schematic)
    # storage
    ax.add_patch(Rectangle((-130, 190), 82, 100, fc="#b9b5aa", alpha=0.16,
                           ec=CTX_E, lw=0.8, ls=(0, (4, 3)), zorder=1))
    ax.text(-89, 240, "STORAGE 10x10\nFULL - OFF-LIMITS", fontsize=7,
            family="monospace", color=CTX_E, ha="center", va="center")
    # overall dims
    dim_h(ax, 292, 0, 132, ftin(132) + " CLEAR", above=True)
    dim_v(ax, 158, 0, 264, ftin(264) + " CLEAR", side=1)


def title_block(ax, opt, name, spec, sheet):
    ax.add_patch(Rectangle((-150, -148), 320, 44, fc=PAPER, ec=INK, lw=1.4, zorder=10))
    ax.plot([-62, -62], [-148, -104], color=INK, lw=0.9, zorder=11)
    ax.plot([78, 78], [-148, -104], color=INK, lw=0.9, zorder=11)
    ax.text(-142, -118, f"OPTION {opt}", fontsize=15, family="monospace",
            weight="bold", color=INK, va="center", zorder=11)
    ax.text(-142, -138, f"SHEET {sheet}", fontsize=7.5, family="monospace",
            color=DIMC, va="center", zorder=11)
    ax.text(-54, -118, name, fontsize=9.5, family="monospace", weight="bold",
            color=INK, va="center", zorder=11)
    ax.text(-54, -138, spec, fontsize=7.5, family="monospace", color=DIMC,
            va="center", zorder=11)
    # legend
    ax.add_patch(Rectangle((86, -122), 12, 6, fc=INK, zorder=11))
    ax.text(102, -119, "EXISTING", fontsize=6.6, family="monospace", color=INK, va="center", zorder=11)
    ax.add_patch(Rectangle((86, -132), 12, 6, fc=AMBER, ec=AMBER_E, zorder=11))
    ax.text(102, -129, "NEW 2x4+PANEL", fontsize=6.6, family="monospace", color=INK, va="center", zorder=11)
    ax.plot([86, 98], [-137, -137], color=CURT, lw=1.4, zorder=11)
    ax.text(102, -137, "CURTAIN (DOOR LATER)", fontsize=6.6, family="monospace", color=INK, va="center", zorder=11)
    ax.plot([86, 98], [-144, -144], color=WINBLU, lw=1.2, zorder=11)
    ax.text(102, -144, "WINDOW", fontsize=6.6, family="monospace", color=INK, va="center", zorder=11)
    ax.text(160, -113, 'SCALE 3/16"=1\'-0"', fontsize=6.6, family="monospace",
            color=DIMC, va="center", ha="right", zorder=11)
    ax.text(160, -104, "", fontsize=6, zorder=11)


def stamp(ax, text, x=66, y=120, fs=28, rot=16):
    ax.text(x, y, text, fontsize=fs, family="monospace", weight="bold",
            color=STAMP, alpha=0.75, ha="center", va="center", rotation=rot,
            bbox=dict(boxstyle="square,pad=0.35", fc="none", ec=STAMP, lw=2.6, alpha=0.75),
            zorder=12)


# ---------------------------------------------------------------- OPTION A
def option_a():
    fig, ax = new_ax()
    shell_and_context(ax)
    # new walls: X36 (Y0-96) · Y96 (X36-132, RO 88-120) · Y164 (X0-132, RO 8-40)
    wall(ax, 36, 0, 4, 96, new=True)
    wall(ax, 36, 96, 52, 4, new=True)
    wall(ax, 120, 96, 12, 4, new=True)
    wall(ax, 0, 164, 8, 4, new=True)
    wall(ax, 40, 164, 92, 4, new=True)
    # BR-B door: RO X88-120 in Y96 wall, opens to lounge
    squiggle(ax, 89, 98, 119, 98)
    door_swing(ax, 118, 100, 30, 90, 180, 135)
    dim_h(ax, 88, 88, 120, '32" RO', above=False)
    # BR-A door: RO X8-40 in Y164 wall
    squiggle(ax, 9, 166, 39, 166)
    door_swing(ax, 10, 168, 30, 0, 90, 45)
    dim_h(ax, 158, 8, 40, '32" RO', above=False)
    # furniture
    furn(ax, 92, 8, 38, 75, "TWIN\n38x75", rot=90)
    furn(ax, 36, 104, 48, 48, "ASHLEY\n4x4")
    furn(ax, 84, 104, 48, 48, "ASHLEY\n4x4")
    furn(ax, 28, 222, 75, 38, "TWIN 38x75")
    # labels
    room_label(ax, 18, 22, "VEST.", "3'x8'")
    room_label(ax, 86, 52, "BR-B", "8'x8' + WINDOW")
    room_label(ax, 66, 150, "LOUNGE", "11'x5'-4\" - 2 OF 3 ASHLEY")
    room_label(ax, 66, 196, "BR-A", "11'x8' + WINDOW")
    # dim chains
    dim_v(ax, -22, 0, 96, ftin(96), side=-1)
    dim_v(ax, -22, 100, 164, ftin(64), side=-1)
    dim_v(ax, -22, 168, 264, ftin(96), side=-1)
    dim_h(ax, -20, 0, 36, ftin(36), above=False)
    dim_h(ax, -20, 40, 132, ftin(92), above=False)
    stamp(ax, "PREV PICK", fs=22)
    title_block(ax, "A", "END BEDROOMS + CENTER LOUNGE",
                "3 STRAIGHT RUNS - 27 LF - WALLS ~$390 - BOTH WINDOWS USED", "A-101")
    fig.savefig(os.path.join(OUT, "option-a.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- OPTION B
def option_b():
    fig, ax = new_ax()
    shell_and_context(ax)
    # NS wall X36 Y72-264 with two ROs (Y104-136, Y200-232)
    wall(ax, 36, 72, 4, 32, new=True)
    wall(ax, 36, 136, 4, 64, new=True)
    wall(ax, 36, 232, 4, 32, new=True)
    wall(ax, 40, 72, 92, 4, new=True)     # EW wall Y72
    wall(ax, 40, 168, 92, 4, new=True)    # divider Y168
    # BR-B door
    squiggle(ax, 38, 105, 38, 135)
    door_swing(ax, 40, 134, 30, 270, 360, 315)
    dim_v(ax, 52, 104, 136, '32" RO', side=1)
    # BR-A door
    squiggle(ax, 38, 201, 38, 231)
    door_swing(ax, 40, 230, 30, 270, 360, 315)
    dim_v(ax, 52, 200, 232, '32" RO', side=1)
    # furniture
    furn(ax, 92, 84, 38, 75, "TWIN\n38x75", rot=90)
    furn(ax, 44, 222, 75, 38, "TWIN 38x75")
    furn(ax, 8, 10, 48, 48, "ASHLEY\n4x4")
    furn(ax, 60, 10, 48, 48, "ASHLEY\n4x4")
    # labels
    room_label(ax, 86, 130, "BR-B", "7'-8\"x7'-8\" - NO WINDOW")
    room_label(ax, 86, 196, "BR-A", "7'-8\"x7'-8\" + WINDOW")
    room_label(ax, 18, 160, "HALL", "3'x16'")
    room_label(ax, 66, 40, "ENTRY / FLEX", "11'x6'")
    ax.text(18, 246, "DEAD\nEND", fontsize=6.6, family="monospace", color=STAMP,
            ha="center", va="center")
    # dims
    dim_v(ax, -22, 0, 72, ftin(72), side=-1)
    dim_v(ax, -22, 76, 168, ftin(92), side=-1)
    dim_v(ax, -22, 172, 264, ftin(92), side=-1)
    dim_h(ax, -20, 0, 36, ftin(36), above=False)
    dim_h(ax, -20, 40, 132, ftin(92), above=False)
    title_block(ax, "B", "CORNER STACK + WEST HALLWAY",
                "32 LF - WALLS ~$430 - 1 OF 2 WINDOWS - BR-B IS WINDOWLESS", "A-102")
    fig.savefig(os.path.join(OUT, "option-b.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- OPTION C
def option_c():
    fig, ax = new_ax()
    shell_and_context(ax)
    # EW wall Y96 X36-132 · NS wall X36 Y96-180 (RO Y112-144) · EW wall Y180 X0-132 (RO 8-40)
    wall(ax, 36, 96, 96, 4, new=True)
    wall(ax, 36, 100, 4, 12, new=True)
    wall(ax, 36, 144, 4, 36, new=True)
    wall(ax, 0, 180, 8, 4, new=True)
    wall(ax, 40, 180, 92, 4, new=True)
    # BR-B door (west wall onto hall)
    squiggle(ax, 38, 113, 38, 143)
    door_swing(ax, 40, 142, 30, 270, 360, 315)
    dim_v(ax, 52, 112, 144, '32" RO', side=1)
    # BR-A door (Y180 wall at hall end)
    squiggle(ax, 9, 182, 39, 182)
    door_swing(ax, 10, 184, 30, 0, 90, 45)
    dim_h(ax, 174, 8, 40, '32" RO', above=False)
    # furniture
    furn(ax, 92, 102, 38, 75, "TWIN\n38x75", rot=90)
    furn(ax, 28, 222, 75, 38, "TWIN 38x75")
    furn(ax, 8, 10, 48, 48, "ASHLEY\n4x4")
    furn(ax, 60, 10, 48, 48, "ASHLEY\n4x4")
    # labels
    room_label(ax, 86, 140, "BR-B", "7'-8\"x6'-8\" - NO WINDOW")
    room_label(ax, 66, 205, "BR-A", "11'x6'-8\" + WINDOW")
    room_label(ax, 18, 140, "HALL", "3'x7'")
    room_label(ax, 66, 46, "ENTRY / FLEX", "11'x8'")
    # dims
    dim_v(ax, -22, 0, 96, ftin(96), side=-1)
    dim_v(ax, -22, 100, 180, ftin(80), side=-1)
    dim_v(ax, -22, 184, 264, ftin(80), side=-1)
    dim_h(ax, -20, 0, 36, ftin(36), above=False)
    dim_h(ax, -20, 40, 132, ftin(92), above=False)
    title_block(ax, "C", "MIDDLE ROOM + L HALLWAY",
                "26 LF - WALLS ~$375 - 1 OF 2 WINDOWS - 21 SF DEAD HALL", "A-103")
    fig.savefig(os.path.join(OUT, "option-c.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- OPTION D
def option_d():
    fig, ax = new_ax()
    shell_and_context(ax)
    # single EW wall Y180 X0-132, RO 8-40
    wall(ax, 0, 180, 8, 4, new=True)
    wall(ax, 40, 180, 92, 4, new=True)
    squiggle(ax, 9, 182, 39, 182)
    door_swing(ax, 10, 184, 30, 0, 90, 45)
    dim_h(ax, 174, 8, 40, '32" RO', above=False)
    # curtain corner for the second sleeper (SE corner)
    ax.plot([80, 80], [0, 96], color=CURT, lw=1.4, ls=(0, (5, 3)), zorder=6)
    ax.plot([80, 132], [96, 96], color=CURT, lw=1.4, ls=(0, (5, 3)), zorder=6)
    ax.text(84, 100, "CEILING CURTAIN TRACK", fontsize=6.4, family="monospace",
            color=CURT, ha="left", va="bottom")
    # furniture
    furn(ax, 92, 8, 38, 75, "TWIN\n38x75", rot=90)
    furn(ax, 28, 222, 75, 38, "TWIN 38x75")
    furn(ax, 8, 132, 48, 48, "ASHLEY\n4x4")
    furn(ax, 56, 132, 48, 48, "ASHLEY\n4x4")
    furn(ax, 8, 84, 48, 48, "ASHLEY\n4x4")
    # labels
    room_label(ax, 66, 205, "BR-A", "11'x6'-8\" + WINDOW")
    room_label(ax, 45, 145, "OPEN STUDIO", "11'x15'")
    room_label(ax, 104, 60, "CURTAIN POD", "FABRIC ONLY")
    # dims
    dim_v(ax, -22, 0, 180, ftin(180), side=-1)
    dim_v(ax, -22, 184, 264, ftin(80), side=-1)
    title_block(ax, "D", "ONE WALL + CURTAIN CORNER",
                "11 LF - WALLS ~$160 - ONLY ONE REAL ROOM", "A-104")
    fig.savefig(os.path.join(OUT, "option-d.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- OPTION E
def option_e():
    """User's pivot: no middle lounge, 2 walls only. Both bedrooms stacked at
    the far (north) end, split by one short divider; lounge = the entry end."""
    fig, ax = new_ax()
    shell_and_context(ax)
    # crosswise wall Y180 X0-132 with TWO ROs (X16-48 west room, X84-116 east room)
    wall(ax, 0, 180, 16, 4, new=True)
    wall(ax, 48, 180, 36, 4, new=True)
    wall(ax, 116, 180, 16, 4, new=True)
    # divider X64 from the crosswise wall to the north wall
    wall(ax, 64, 184, 4, 80, new=True)
    # west room door
    squiggle(ax, 17, 182, 47, 182)
    door_swing(ax, 18, 184, 30, 0, 90, 45)
    dim_h(ax, 174, 16, 48, '32" RO', above=False)
    # east room door
    squiggle(ax, 85, 182, 115, 182)
    door_swing(ax, 116, 184, 30, 90, 180, 135)
    dim_h(ax, 174, 84, 116, '32" RO', above=False)
    # furniture: a twin in each pocket room, couches in the big south lounge
    furn(ax, 13, 187, 38, 75, "TWIN\n38x75", rot=90)
    furn(ax, 90, 187, 38, 75, "TWIN\n38x75", rot=90)
    # the ACTUAL couch: three Ashley 4x4 sections in a straight 12' row,
    # pushed against the east wall exactly as it sits today
    furn(ax, 82, 16, 48, 48, "ASHLEY\n4x4")
    furn(ax, 82, 64, 48, 48, "ASHLEY\n4x4")
    furn(ax, 82, 112, 48, 48, "ASHLEY\n4x4")
    # labels
    room_label(ax, 32, 244, "BR-W", "5'-4\"x6'-8\" - NO WINDOW")
    room_label(ax, 100, 250, "BR-E", "5'-4\"x6'-8\" + WINDOW")
    ax.text(32, 224, "FAN + LOUVER", fontsize=6.2, family="monospace",
            color=DIMC, ha="center", va="center")
    room_label(ax, 44, 44, "LOUNGE / ENTRY", "11'x15' - 3-PC ROW AS-IS")
    # dims
    dim_v(ax, -22, 0, 180, ftin(180), side=-1)
    dim_v(ax, -22, 184, 264, ftin(80), side=-1)
    dim_h(ax, 280, 0, 64, ftin(64), above=False)
    dim_h(ax, 280, 68, 132, ftin(64), above=False)
    stamp(ax, "2 WALLS", x=66, y=120, fs=26)
    title_block(ax, "E", "STACKED END ROOMS + BIG ENTRY LOUNGE",
                "2 WALLS ONLY - 18 LF - WALLS ~$260 - ONE ROOM WINDOWLESS", "A-105")
    fig.savefig(os.path.join(OUT, "option-e.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- OPTION F
def option_f():
    """User's markup, queen-sized: two 8x8 rooms stacked top-right, queen in
    each, west corridor for circulation, entry/lounge zone at the bottom."""
    fig, ax = new_ax()
    shell_and_context(ax)
    wall(ax, 36, 72, 4, 60, new=True)
    wall(ax, 36, 164, 4, 12, new=True)
    wall(ax, 36, 208, 4, 56, new=True)
    wall(ax, 40, 72, 92, 4, new=True)
    wall(ax, 40, 168, 92, 4, new=True)
    # doors off the west corridor, flanking the divider (never facing a bed foot)
    squiggle(ax, 38, 133, 38, 163)
    door_swing(ax, 40, 162, 30, 270, 360, 315)
    dim_v(ax, 52, 132, 164, '32" RO', side=1)
    squiggle(ax, 38, 177, 38, 207)
    door_swing(ax, 40, 178, 30, 0, 90, 45)
    dim_v(ax, 52, 176, 208, '32" RO', side=1)
    # QUEENS head-EAST, floated for a nightstand each side (16" per side)
    furn(ax, 52, 92, 80, 60, "QUEEN 60x80\nHEAD EAST")
    pillows(ax, 92)
    nightstand(ax, 114, 76)
    nightstand(ax, 114, 153)
    furn(ax, 52, 188, 80, 60, "QUEEN 60x80\nHEAD @ WINDOW")
    pillows(ax, 188)
    nightstand(ax, 114, 172)
    nightstand(ax, 114, 249)
    furn(ax, 8, 10, 48, 48, "ASHLEY\n4x4")
    furn(ax, 60, 10, 48, 48, "ASHLEY\n4x4")
    room_label(ax, 86, 158, "BR-B", "7'-8\"x7'-8\" - NO WINDOW - QUEEN + 2 NS")
    room_label(ax, 86, 180, "BR-A", "7'-8\"x7'-8\" + WINDOW - QUEEN + 2 NS")
    room_label(ax, 18, 160, "HALL", "3'x16'")
    room_label(ax, 66, 40, "ENTRY / LOUNGE", "11'x6' - 2 OF 3 ASHLEY, 3RD UPSTAIRS")
    dim_v(ax, -22, 0, 72, ftin(72), side=-1)
    dim_v(ax, -22, 76, 168, ftin(92), side=-1)
    dim_v(ax, -22, 172, 264, ftin(92), side=-1)
    dim_h(ax, -20, 0, 36, ftin(36), above=False)
    dim_h(ax, -20, 40, 132, ftin(92), above=False)
    stamp(ax, "YOUR MARKUP", fs=20)
    title_block(ax, "F", "TWO 8x8 QUEEN ROOMS (YOUR MARKUP)",
                "3 WALLS - 32 LF - WALLS ~$430 - QUEEN IN EACH - ONE WINDOWLESS", "A-106")
    fig.savefig(os.path.join(OUT, "option-f.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- OPTION G
def option_g():
    """Do-better: the 8x10 pair. One 22-ft wall + one 8-ft divider. Both rooms
    take a queen with a 32-inch aisle AND both hoppers land inside bedrooms."""
    fig, ax = new_ax()
    shell_and_context(ax)
    # NS wall X36, full length, doors at OPPOSITE ends: BR-B at the entry corner,
    # BR-A just past the divider — both swings clear the floated beds
    wall(ax, 36, 0, 4, 6, new=True)
    wall(ax, 36, 38, 4, 98, new=True)
    wall(ax, 36, 168, 4, 96, new=True)
    # divider Y128
    wall(ax, 40, 128, 92, 4, new=True)
    # BR-B door — right at the south corner, two steps from the 3' opening
    squiggle(ax, 38, 7, 38, 37)
    door_swing(ax, 40, 36, 30, 270, 360, 315)
    dim_v(ax, 52, 6, 38, '32" RO', side=1)
    # BR-A door
    squiggle(ax, 38, 137, 38, 167)
    door_swing(ax, 40, 166, 30, 270, 360, 315)
    dim_v(ax, 52, 136, 168, '32" RO', side=1)
    # QUEENS head-EAST, floated: pillows under the hoppers + a nightstand EACH side
    furn(ax, 52, 26, 80, 60, "QUEEN 60x80\nHEAD @ WINDOW")
    pillows(ax, 26)
    nightstand(ax, 114, 9)
    nightstand(ax, 114, 88)
    furn(ax, 52, 186, 80, 60, "QUEEN 60x80\nHEAD @ WINDOW")
    pillows(ax, 186)
    nightstand(ax, 114, 169)
    nightstand(ax, 114, 248)
    room_label(ax, 80, 116, "BR-B", "7'-8\"x10'-8\" + WINDOW - QUEEN + 2 NS")
    room_label(ax, 80, 152, "BR-A", "7'-8\"x11'-0\" + WINDOW - QUEEN + 2 NS")
    ax.text(18, 150, "3' CORRIDOR", fontsize=7, family="monospace", color=DIMC,
            rotation=90, va="center", ha="center")
    dim_v(ax, -22, 0, 128, ftin(128), side=-1)
    dim_v(ax, -22, 132, 264, ftin(132), side=-1)
    dim_h(ax, -20, 0, 36, ftin(36), above=False)
    dim_h(ax, -20, 40, 132, ftin(92), above=False)
    stamp(ax, "2 QUEENS + 2 WINDOWS", x=70, y=126, fs=13, rot=10)
    title_block(ax, "G", "THE 8x10 PAIR - FULL-LENGTH SPLIT",
                "2 WALLS - 30 LF - WALLS ~$420 - QUEEN + WINDOW IN BOTH", "A-107")
    fig.savefig(os.path.join(OUT, "option-g.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- OPTION H
def option_h():
    """User's flip: bedrooms on the WEST side, doors on the OPPOSITE (east) side
    off a 3' gallery along the window wall. Queens float with a nightstand each
    side, heads west. Cost of the flip: neither bedroom has a window."""
    fig, ax = new_ax()
    shell_and_context(ax)
    # BR-B south wall + full-height NS wall at X92 (ROs Y100-132 and Y196-228) + divider
    wall(ax, 0, 72, 92, 4, new=True)
    wall(ax, 92, 72, 4, 28, new=True)
    wall(ax, 92, 132, 4, 64, new=True)
    wall(ax, 92, 228, 4, 36, new=True)
    wall(ax, 0, 168, 92, 4, new=True)
    # doors open west into the rooms, hinged clear of the beds
    squiggle(ax, 94, 101, 94, 131)
    door_swing(ax, 92, 102, 30, 180, 270, 225)
    dim_v(ax, 104, 100, 132, '32" RO', side=1)
    squiggle(ax, 94, 197, 94, 227)
    door_swing(ax, 92, 198, 30, 180, 270, 225)
    dim_v(ax, 104, 196, 228, '32" RO', side=1)
    # QUEENS head-WEST, floated, nightstand each side
    furn(ax, 2, 92, 80, 60, "QUEEN 60x80\nHEAD WEST")
    pillows(ax, 92, x=6)
    nightstand(ax, 4, 76)
    nightstand(ax, 4, 153)
    furn(ax, 2, 188, 80, 60, "QUEEN 60x80\nHEAD WEST")
    pillows(ax, 188, x=6)
    nightstand(ax, 4, 172)
    nightstand(ax, 4, 249)
    room_label(ax, 46, 122, "BR-B", "7'-8\"x7'-8\" - NO WINDOW - QUEEN + 2 NS")
    room_label(ax, 46, 218, "BR-A", "7'-8\"x7'-8\" - NO WINDOW - QUEEN + 2 NS")
    ax.text(116, 160, "3' GALLERY", fontsize=7, family="monospace", color=DIMC,
            rotation=90, va="center", ha="center")
    ax.text(66, 62, "LOUNGE 11'x6' + WINDOW - 2 OF 3 ASHLEY, 3RD UPSTAIRS",
            fontsize=6.8, family="monospace", color=INK, ha="center", va="center")
    furn(ax, 8, 8, 48, 48, "ASHLEY\n4x4")
    furn(ax, 60, 8, 48, 48, "ASHLEY\n4x4")
    dim_v(ax, -22, 0, 72, ftin(72), side=-1)
    dim_v(ax, -22, 76, 168, ftin(92), side=-1)
    dim_v(ax, -22, 172, 264, ftin(92), side=-1)
    dim_h(ax, -20, 0, 92, ftin(92), above=False)
    dim_h(ax, -20, 96, 132, ftin(36), above=False)
    stamp(ax, "WINDOWS LAND IN THE HALL", x=62, y=170, fs=12, rot=10)
    title_block(ax, "H", "WEST BEDROOMS + EAST WINDOW GALLERY",
                "3 WALLS - 32 LF - ~$430 - QUEEN + 2 STANDS EACH - NO BR WINDOWS", "A-108")
    fig.savefig(os.path.join(OUT, "option-h.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- AS-IS
def option_asis():
    """The room exactly as it is today: no new walls, the three-piece Ashley
    row pushed together against the long wall, the twin already down here."""
    fig, ax = new_ax()
    shell_and_context(ax)
    furn(ax, 82, 40, 48, 48, "ASHLEY\n4x4")
    furn(ax, 82, 88, 48, 48, "ASHLEY\n4x4")
    furn(ax, 82, 136, 48, 48, "ASHLEY\n4x4")
    ax.text(70, 112, "3-PC ROW PUSHED TOGETHER\nAGAINST THE WALL", fontsize=7,
            family="monospace", color=INK, rotation=90, ha="center", va="center")
    furn(ax, 30, 222, 75, 38, "TWIN (already here)", dashed=True)
    ax.text(66, 20, "OPEN FLOOR - NOTHING BUILT", fontsize=7.5,
            family="monospace", color=DIMC, ha="center", va="center")
    ax.text(66, -40, "If the row is on the OTHER long wall, say so - one-line fix.",
            fontsize=6.8, family="monospace", color=DIMC, ha="center", va="center")
    title_block(ax, "0", "AS-IS TODAY - EXISTING CONDITIONS ONLY",
                "NO NEW WALLS - 3x ASHLEY 4x4 IN A 12' ROW - TWIN AT THE FAR END", "A-100")
    fig.savefig(os.path.join(OUT, "option-asis.png"), dpi=170)
    plt.close(fig)


# ---------------------------------------------------------------- THE BUILD
def option_j():
    """As ordered: two 8x8 bedrooms, one at each end anchored to the window
    wall so EACH gets a hopper. Futon in the south room, twin in the north
    room, heads at the window. Couches out of the basement for now."""
    fig, ax = new_ax()
    shell_and_context(ax)
    # south room: 8' west wall + 8' north wall (RO X44-76 to the middle zone)
    wall(ax, 36, 0, 4, 96, new=True)
    wall(ax, 36, 96, 8, 4, new=True)
    wall(ax, 76, 96, 56, 4, new=True)
    squiggle(ax, 45, 98, 75, 98)
    door_swing(ax, 76, 100, 30, 90, 180, 135)
    dim_h(ax, 88, 44, 76, '32" RO', above=False)
    # north room: 8' west wall + 8' south wall (RO X44-76 to the middle zone)
    wall(ax, 36, 168, 4, 96, new=True)
    wall(ax, 36, 164, 8, 4, new=True)
    wall(ax, 76, 164, 56, 4, new=True)
    squiggle(ax, 45, 166, 75, 166)
    door_swing(ax, 76, 164, 30, 180, 270, 225)
    dim_h(ax, 158, 44, 76, '32" RO', above=False)
    # FUTON (54x75) south room, head at the window
    furn(ax, 57, 8, 75, 54, "FUTON 54x75\nHEAD @ WINDOW")
    pillows(ax, 8)
    # TWIN (38x75) north room, head at the window
    furn(ax, 57, 209, 75, 38, "TWIN 38x75")
    ax.add_patch(Rectangle((114, 217), 14, 22, fc="#f6f1e4", ec=FURN_E, lw=0.7, zorder=4))
    # labels
    room_label(ax, 86, 78, "BR-S", "7'-8\"x8'-0\" + WINDOW - FUTON")
    room_label(ax, 86, 190, "BR-N", "7'-8\"x8'-0\" + WINDOW - TWIN")
    room_label(ax, 18, 30, "VEST.", "3'x8'")
    ax.text(66, 138, "OPEN MIDDLE 11'x5'-4\" - EMPTY FOR NOW (COUCHES OUT)",
            fontsize=6.8, family="monospace", color=DIMC, ha="center", va="center")
    # dims
    dim_v(ax, -22, 0, 96, ftin(96), side=-1)
    dim_v(ax, -22, 100, 164, ftin(64), side=-1)
    dim_v(ax, -22, 168, 264, ftin(96), side=-1)
    dim_h(ax, -20, 0, 36, ftin(36), above=False)
    dim_h(ax, -20, 40, 132, ftin(92), above=False)
    stamp(ax, "THE BUILD", x=66, y=130, fs=22, rot=12)
    title_block(ax, "J", "TWO 8x8 WINDOW ROOMS - FUTON + TWIN",
                "4x 8' RUNS - 32 LF - WALLS ~$430 - WINDOW IN EACH - NO COUCHES", "A-109")
    fig.savefig(os.path.join(OUT, "option-j.png"), dpi=170)
    plt.close(fig)


option_asis()
option_j()
option_a()
option_b()
option_c()
option_d()
option_e()
option_f()
option_g()
option_h()
print("done:", sorted(f for f in os.listdir(OUT) if f.endswith(".png")))
