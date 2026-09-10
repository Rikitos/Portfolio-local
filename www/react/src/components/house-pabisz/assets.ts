/**
 * Illustrated art for the House Pabisz design (tapestry-style, generated to
 * match the concept's maroon/gold/parchment palette). Single place all of it
 * is imported so HousePabiszHome can build the CSS custom properties the
 * ported stylesheet expects (`--linen-img`, `--seal-img`, etc. — see
 * house-pabisz.css) in one spot.
 */
import linen from '../../assets/img/house-pabisz/linen.png'
import ceremony from '../../assets/img/house-pabisz/Ceremony.png'
import portrait from '../../assets/img/house-pabisz/Portrait-1.png'
import letterTop from '../../assets/img/house-pabisz/LetterTop.png'
import letterBottom from '../../assets/img/house-pabisz/LetterBottom.png'
import letterMiddle from '../../assets/img/house-pabisz/letterMiddle.png'
import friezeElement1 from '../../assets/img/house-pabisz/Frieze-element-1.png'
import friezeElement2 from '../../assets/img/house-pabisz/Frieze-element-2.png'
import friezeElement3 from '../../assets/img/house-pabisz/Frieze-element-3.png'
import friezeV4 from '../../assets/img/house-pabisz/FriezeV4.png'
import baronyFilledTop from '../../assets/img/house-pabisz/BG-edges-filled-top.png'
import baronyFilledMid from '../../assets/img/house-pabisz/BG-edges-filled-mid.png'
import baronyFilledBottom from '../../assets/img/house-pabisz/BG-edges-filled-bottom.png'
// The "-alpha" files are ours: the originals came in with an opaque
// near-white backing instead of real transparency (would show as a white
// box, especially in dark mode), so we ran them through a whiteness-based
// cutout (src/assets/img/house-pabisz — see whiten-to-alpha.ps1 in the
// scratchpad this was generated from) to punch real alpha into the corners.
import coatArm1 from '../../assets/img/house-pabisz/Coat-arm-1-alpha.png'
import coatArm2 from '../../assets/img/house-pabisz/Coat-arm-2-alpha.png'
import baronyTransTop from '../../assets/img/house-pabisz/BG-edges-transparent-top-alpha.png'
import baronyTransMid from '../../assets/img/house-pabisz/BG-edges-transparent-mid-alpha.png'
import baronyTransBottom from '../../assets/img/house-pabisz/BG-edges-transparent-bottom-alpha.png'
import flagPL from '../../assets/img/house-pabisz/Flag-PL-circle-alpha.png'
import flagEN from '../../assets/img/house-pabisz/Flag-EN-circle-alpha.png'

export const housePabiszArt = {
  linen,
  ceremony,
  portrait,
  // Coat-arm-2 carries the "P" monogram, so it reads as the personal mark
  // that recurs in the header/footer; Coat-arm-1 (fuller heraldic crest) is
  // reserved for the larger, once-per-section emblem.
  brandMark: coatArm2,
  sectionEmblem: coatArm1,
  letterTop,
  letterBottom,
  letterMiddle,
  // four distinct embroidered strips, one per divider between sections —
  // no repeats across the page.
  friezeBands: [friezeElement1, friezeElement2, friezeElement3, friezeV4],
  baronyFilled: { top: baronyFilledTop, mid: baronyFilledMid, bottom: baronyFilledBottom },
  baronyTrans: { top: baronyTransTop, mid: baronyTransMid, bottom: baronyTransBottom },
  flags: { pl: flagPL, en: flagEN },
}
