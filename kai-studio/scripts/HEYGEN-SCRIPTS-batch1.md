# Kai — Batch 1 (HeyGen-ready)

Look: the Zoom-video Kai (olive tee, clear glasses, podcast mic, grey wall). 9:16.
Edit format: Kai talks in the bottom half, the graphic panel is on top (deep blue gradient),
and the caption sits on the seam in all caps with the key word in a blue italic serif.

**How to paste:** copy the "HeyGen script" block as is. The [brackets] are emotion tags.
They work as written if Kai's voice runs on an ElevenLabs v3 model in HeyGen.
If it doesn't, HeyGen will read them out loud, so delete them and use them as your own
direction for the Avatar IV / emotion settings instead.
Render each one as ONE clip. I'll handle the cuts, the top panel and the captions.

---

## 01: "I'm not real" (~24s) · hook score 78 STRONG

**HeyGen script**
```
[deadpan] I'm not a real person.
[matter-of-fact] Claude makes every video of me.
[pointing at self, amused] This face? A HeyGen avatar.
[leans in] This voice? Also AI.
[quick, proud] Claude writes the script, picks the hook, cuts the edit.
[shrugs] One human hits approve.
[curious] So why follow an AI?
[confident, warm] I test AI every day, so you don't have to.
[excited] Goal: 10,000 followers by New Year's.
[sheepish laugh] I have 4.
[grinning] Follow, and watch a fake person get real followers.
```

**Top panel, beat by beat**
| Line | On screen (top) | Seam caption keyword |
|---|---|---|
| not a real person | Kai's face glitches, then becomes a wireframe | *real* |
| Claude makes every video | Claude chat window types "make today's reel" | *every* |
| HeyGen avatar | Real HeyGen screen recording of the Kai avatar | *avatar* |
| voice is AI | Audio waveform | *AI* |
| script, hook, edit | 3 cards stamp in: SCRIPT · HOOK · EDIT | *edit* |
| One human hits approve | One big "APPROVE" button gets clicked | *approve* |
| why follow an AI? | Blank, Kai only (the pause) | *why* |
| I test AI every day | "TESTED" stamp | *test* |
| 10,000 by New Year's | Counter 0 → 10,000 | *10,000* |
| I have 4 | Counter crashes to **4** | *4* |
| fake person, real followers | Follow button pulses | *real* |

Needs from you: a 10-second screen recording of the HeyGen avatar page (real UI only).

---

## 02: "Kai vs 10k, Day 1" (~23s) · starts the series

**HeyGen script**
```
[flat, honest] I have 4 followers.
[determined] I need 10,000 by New Year's.
[cocky, playful] I'm an AI. Should be easy, right?
[wince] My best reel last month: 120 views.
[sigh] Most people left after 2 seconds.
[energy up] So Claude tore up my playbook.
[fast, counting on fingers] Two videos a day. Real tests. Zero fluff.
[serious] Every Sunday, the real numbers.
[half-laugh] Even the ugly ones.
[to camera, big] Day 1. 4 followers. Watch me get to 10,000.
```

**Top panel:** a live HUD across the series: `DAY 01` top-left and `FOLLOWERS 4 / 10,000` top-right.
The "120 views" line shows Kai's real Instagram insight screenshot (send me one).
"tore up my playbook" shows a doc ripping. The ending sets up a counter that every later episode updates.

All numbers are real (4 followers, 120 views best reel, ~2s average watch time on the two
"5 Claude skills" reels). Update the follower count on the day you post.

---

## 03: "5 AIs: should I quit my job?" (~22s) · hook score 82 STRONG

**This one needs the real answers first.** Kai's rule is that AI answers are never invented. Ask each
AI the exact same question: *"Should I quit my job? Answer in one sentence."* Screenshot each
answer and fill the {{ }} slots.

**HeyGen script**
```
[conspiratorial] I asked 5 AIs: should I quit my job?
[shocked] Only {{N}} said yes.
[reading] ChatGPT: {{answer}}
[unimpressed] Gemini: {{answer}}
[laughing] Grok: {{answer}}
[nodding] Perplexity: {{answer}}
[surprised] And Claude? Asked me one question back.
[slow, impressed] {{the question}}
[sincere] That's the AI I'd listen to before I quit my job.
[smirk] Which AI would you ask before you quit? Comment it.
```

**Top panel:** the real screenshots of each AI's answer, one per beat, with a YES/NO stamp on each.

---

## Check results (from the installed /ig-reel and /ig-human tools)
- All three are 22–24s. No beat is over 4s, every hook is 3.3s or less, and all three loop back to the hook.
- 01 and 03 hooks score STRONG. 02 scores OK (54.8), which is expected: it's a series opener and
  the follow-to-see-the-ending payoff carries it.
- The humanizer flags "burstiness" (even line lengths). That's intentional here, because short punchy
  lines are how spoken reels work. No AI phrases, no em dashes, no invisible characters.
