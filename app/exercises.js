export const EXERCISES=[
['bench','杠铃卧推','胸部','杠铃总重','press','平躺于凳面，双脚着地；缓慢下放，再推起。'],
['incline','上斜哑铃卧推','胸部','单只哑铃','press','背部贴住上斜靠背；双臂控制下放与推起。'],
['squat','杠铃深蹲','腿部','杠铃总重','squat','双脚稳定，屈髋屈膝下蹲，再站起。'],
['deadlift','罗马尼亚硬拉','臀腿','杠铃总重','hinge','膝微屈，髋向后移，重量沿腿部下降。'],
['legpress','器械腿举','腿部','器械标重','squat','背部贴靠垫，双腿屈伸，控制重量。'],
['pulldown','高位下拉','背部','器械标重','pull','躯干稳定，将握把拉向胸前，再缓慢还原。'],
['row','坐姿划船','背部','器械标重','row','坐姿挺胸，肘向后拉，再缓慢伸臂。'],
['shoulder','哑铃推肩','肩部','单只哑铃','press','坐姿稳定，从肩侧向上推举，再控制还原。'],
['raise','哑铃侧平举','肩部','单只哑铃','raise','肘部微屈，双臂向两侧抬起，再慢慢下降。'],
['curl','哑铃弯举','手臂','单只哑铃','curl','上臂保持稳定，屈肘抬起，再缓慢放下。'],
['triceps','绳索下压','手臂','器械标重','pull','肘在身体两侧，向下伸臂，再控制还原。'],
['pullup','引体向上','背部','自重','pull','双手握杠，屈肘上拉，再缓慢还原。']
].map(([id,name,muscle,weight_basis,diagram,instruction])=>({id,name,muscle,weight_basis,diagram,instruction,builtin:true}));
export function exerciseDiagram(type){const lines={press:'M38 63L55 52L75 25 M55 52L79 51 M31 68L76 68 M75 25L99 25',squat:'M70 37L53 57L72 69L60 91 M70 37L91 48 M48 32L96 32',hinge:'M56 30L83 49L57 59L45 88 M83 49L78 76 M64 79L93 79',pull:'M64 47L47 24L40 12 M64 47L83 24L90 12 M64 47L63 70L42 89 M63 70L83 89 M29 10L102 10',row:'M65 37L61 62L88 72L96 86 M65 44L91 48 M44 65L72 65',raise:'M65 40L39 47L22 37 M65 40L91 47L108 37 M65 40L65 69L45 89 M65 69L85 89',curl:'M65 40L43 56L48 40 M65 40L87 56L82 40 M65 40L65 69L48 89 M65 69L82 89'};return `<svg viewBox="0 0 130 105" role="img" aria-label="动作姿态示意"><circle cx="65" cy="25" r="9" fill="currentColor"/><path d="${lines[type]||lines.raise}" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
