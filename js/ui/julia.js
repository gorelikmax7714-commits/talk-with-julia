// Julia's illustrated avatar. The .mouth group animates while she speaks.

export function juliaSvg(extraClass = '') {
  return `
<svg class="avatar ${extraClass}" viewBox="0 0 100 100" aria-label="Julia" role="img">
  <defs>
    <clipPath id="jc"><circle cx="50" cy="50" r="48"/></clipPath>
  </defs>
  <circle cx="50" cy="50" r="48" fill="#d3ebfa"/>
  <g clip-path="url(#jc)">
    <path d="M18 100c2-20 16-30 32-30s30 10 32 30z" fill="#e23d3d"/>
    <path d="M38 72l12 10 12-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <path d="M22 54c-6-26 8-42 28-42s34 14 28 42c-2 10-6 18-10 22H32c-4-4-8-12-10-22z" fill="#8a4b2a"/>
    <rect x="44" y="60" width="12" height="12" rx="5" fill="#f2c3a0"/>
    <ellipse cx="50" cy="46" rx="20" ry="22" fill="#f8d2b4"/>
    <path d="M29 42c4-14 14-20 24-20 9 0 17 6 19 16-8-2-18-6-24-12-4 8-12 14-19 16z" fill="#8a4b2a"/>
    <circle cx="42" cy="47" r="2.6" fill="#1f2a44"/>
    <circle cx="58" cy="47" r="2.6" fill="#1f2a44"/>
    <path d="M38 41q4-3 8 0M54 41q4-3 8 0" stroke="#6b3a20" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="37" cy="55" r="4" fill="#f59a9a" opacity="0.55"/>
    <circle cx="63" cy="55" r="4" fill="#f59a9a" opacity="0.55"/>
    <g class="mouth"><path d="M43 59q7 7 14 0q-7 3-14 0z" fill="#c2384a"/></g>
    <circle cx="29.5" cy="53" r="2.4" fill="#ffc23d"/>
    <circle cx="70.5" cy="53" r="2.4" fill="#ffc23d"/>
  </g>
</svg>`;
}

export function setTalking(root, talking) {
  root.querySelectorAll('.avatar').forEach((a) => a.classList.toggle('talking', talking));
}
