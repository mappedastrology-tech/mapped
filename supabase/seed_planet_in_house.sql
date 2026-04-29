-- Seed file for kb_planet_in_house
-- 120 combinations: 10 planets × 12 houses
-- Insert statements for all planet-house placements

-- SUN IN HOUSES (Identity, core self, life direction)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  1,
  $$You lead with your essence. Your identity is unmistakable—people know exactly who you are without you having to explain. Your core self feels central to everything you do, like the sun itself: visible, radiating outward. Life is about becoming more fully yourself.$$,
  $$You naturally stand out. People gravitate toward you for direction or validation. In conversations, you tend to be the reference point. Your mood and energy set the tone for environments you enter.$$,
  $$You have authentic confidence grounded in self-knowledge. Your sense of purpose is clear and directional. You're not pretending to be anyone else, which gives you real magnetism.$$,
  $$You can overshadow others without meaning to. Self-focus can read as self-centeredness. You may struggle when the spotlight moves away or when others don't validate your perspective.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  2,
  $$Your self-worth is built through what you own, earn, and build. Your identity is tied to your capacity to generate resources and stability. You become yourself by establishing real security—not abstract concepts, but tangible evidence of your value.$$,
  $$You think about money constantly but often unconsciously. Spending and earning feel personal. Success markers (nice things, reliable income) matter deeply to your sense of okayness. You're building your nest before you know it.$$,
  $$You're resourceful and driven to establish security. Your identity is grounded, not scattered. You take long-term wealth-building seriously and have natural capacity to make things work financially.$$,
  $$You can conflate personal worth with net worth. Material loss feels like identity loss. You may withhold yourself from situations where you can't control or own the outcome.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  3,
  $$You discover who you are by talking and learning. Your mind is your primary instrument. Communication isn't just how you express—it's how you become yourself. Every conversation, every idea, shapes your sense of identity.$$,
  $$You're rarely silent. Your thoughts matter to you. You need to articulate things to understand them. Siblings, neighbors, colleagues are mirrors where you figure out who you are.$$,
  $$You're naturally curious and adaptable. Your intelligence feels core to your identity—not as arrogance but as genuine interest. You make complex ideas accessible and people trust your perspective.$$,
  $$You can scatter yourself across too many conversations and interests. Your identity can feel fragmented because you're always learning the next thing. You may over-explain to prove your worth.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  4,
  $$Home and family ARE your identity. Your core self is rooted in where you come from and where you belong. You become yourself by creating a safe place, either literally or emotionally. Belonging isn't nice to have—it's foundational.$$,
  $$You think about family constantly. Decisions get filtered through the lens of home security. You're probably the one organizing family gatherings or maintaining continuity. Roots run deep.$$,
  $$You have genuine warmth and loyalty. Family members—chosen or biological—trust you with their vulnerabilities. You create safe spaces people want to return to. Your sense of purpose is grounded in connection.$$,
  $$You can be overly identified with family patterns. Leaving or changing your family ties can feel like losing yourself. You may struggle with independence or resist change because it threatens the home base.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  5,
  $$You are a creator. Your identity lives in what you make, perform, or bring into being. Children, art, romance—these aren't hobbies. They're how you know you're alive. Play and risk are central to becoming yourself.$$,
  $$You pursue pleasure with intention. You notice what lights you up. Boredom is almost painful because it disconnects you from vitality. You're drawn to risk and self-expression; safety can feel suffocating.$$,
  $$You have infectious creative energy. People catch your enthusiasm. You're generous with attention in romantic or mentoring relationships. You take joy seriously—as spiritual practice, not frivolity.$$,
  $$You can be dramatic or need excessive validation for your creations. Love and romance can feel like identity crises when they end. You may avoid responsibility by chasing what's fun in the moment.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  6,
  $$Your identity is built through service and mastery of skills. You become yourself by being useful, competent, and health-conscious. Your work isn't separate from who you are—it's the primary place you prove your worth.$$,
  $$You're detail-oriented and often critical. You notice what's broken and can't ignore it. Work feels personal, even when it shouldn't. You think about your health, routine, and productivity regularly.$$,
  $$You're reliable and genuinely skilled. You take pride in workmanship. You have natural discipline and can improve anything you focus on. People trust you because you follow through.$$,
  $$You can over-identify with productivity. Illness or inability to work can feel like identity collapse. Perfectionism can limit you. You may judge yourself and others harshly for perceived inefficiency.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  7,
  $$You become yourself in relationship. Your identity is partly constructed through partnership. You need a mirror to know who you are. Marriage or significant partnership isn't optional—it's central to your development.$$,
  $$You're naturally focused on others. You think about your relationship constantly. You're good at seeing what partners need and adapting to that. One-on-one connection energizes you more than anything else.$$,
  $$You're genuine in partnership. You invest fully and people feel valued. You have natural diplomacy and can negotiate differences. You're not afraid of commitment or emotional intimacy.$$,
  $$You can lose yourself in relationship. Without a partner, you may feel incomplete. You might compromise your own needs too readily. Conflict can feel like identity threat.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  8,
  $$You become yourself through transformation and depth. Your identity isn't fixed—it evolves through crisis, intimacy, and confrontation with shadow. You're drawn to intensity and taboo subjects. Surface living feels inauthentic.$$,
  $$You probe beneath what people say. You're not satisfied with polite. You think about death, sexuality, power, and shared money. You go through cycles of deep change. Secrets feel claustrophobic.$$,
  $$You have psychological insight. You're not afraid of your own darkness or others'. You're loyal in profound ways. You can handle other people's trauma without deflecting.$$,
  $$You can be obsessive or controlling with partners. Shared resources feel like identity battles. You may keep people at distance until you decide they've earned access. Betrayal cuts deeply.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  9,
  $$Your identity is expansive and philosophical. You become yourself by seeking meaning, traveling (physically or mentally), and connecting to something larger than yourself. Beliefs and worldview are core to who you are.$$,
  $$You're always studying or planning the next journey. You question authority and conventional wisdom. You think about your values and purpose regularly. You get bored with small talk fast.$$,
  $$You're genuinely enthusiastic about discovery. People trust your perspective because you've pursued knowledge seriously. You're not dogmatic—you follow truth where it leads. You inspire others to grow.$$,
  $$You can be preachy or self-righteous about beliefs. Confined spaces or limiting situations feel suffocating. You may run from commitment in pursuit of freedom. You can be restless.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  10,
  $$Your identity is public and professional. You become yourself through career, reputation, and visible achievement. What you accomplish in the world IS who you are. Recognition matters—not vanity, but confirmation of purpose.$$,
  $$You're aware of your public image. You make decisions considering reputation. You think about your career constantly. Success isn't abstract—you want to see it in real position and respect.$$,
  $$You have natural authority. People see you as capable and aim higher because of it. You're willing to take responsibility and lead. Your ambition is grounded in genuine competence.$$,
  $$You can be overly focused on external markers of success. Personal relationships may suffer from career focus. You struggle when you're not progressing visibly. You may feel empty despite achievement.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  11,
  $$You become yourself through community and shared causes. Your identity is tied to groups, friendships, and collective vision. You're most alive when working toward something bigger with others. Belonging to the right tribe is essential.$$,
  $$You network naturally. You think about your circle and community constantly. You're drawn to causes or groups that align with your values. Solo success doesn't feel successful.$$,
  $$You're genuinely interested in people beyond utility. You hold space for others' visions. You have natural charisma in groups—not performing, just authentically yourself. You attract quality friendships.$$,
  $$You can lose yourself in group identity. Rejection from community cuts deeply. You may avoid solo projects because they feel isolating. You can prioritize group needs over personal boundaries.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Sun',
  12,
  $$Your identity is hidden or spiritual. You become yourself through solitude, creativity, spirituality, or work behind the scenes. The self you show the world is partial—your real essence is known by few. Mystery is authentic to you.$$,
  $$You need regular solitude. Public visibility can feel uncomfortable. You notice what's unseen—patterns, suffering, spiritual dimensions. You may feel like an outsider even in familiar places.$$,
  $$You have genuine depth. You're not performing for others. You can access subtle realities others miss. Your spirituality or creativity is authentic because it's not for show.$$,
  $$You can be invisible even when present. You may struggle to take up space or claim credit. Others may not see your real capacity. You might sabotage visibility out of discomfort.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- MOON IN HOUSES (Emotions, needs, safety, inner self)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  1,
  $$Your emotions are visible. Your feelings live on your face and in your body—you can't really hide them. People sense your mood instantly. Your emotional responsiveness is primary; you navigate the world feeling first.$$,
  $$Your mood shifts noticeably. People check your energy before approaching you. You protect yourself by reading rooms and people. You lead with vulnerability, sometimes before you mean to.$$,
  $$You're naturally empathetic and relatable. People trust you with feelings because you clearly have them too. You're not pretending okayness. Your accessibility draws people to you.$$,
  $$Your moods can overwhelm you and those around you. You may seem unpredictable or overly sensitive. You can absorb others' feelings, losing track of your own. Protection feels hard.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  2,
  $$Your emotional security depends on material stability. You need things—possessions, money, comfort—to feel safe. You shop, collect, and hold onto objects for emotional reassurance. Financial safety is emotional safety.$$,
  $$You're aware of your resources constantly. You worry about running out. You hold onto things longer than others might. Spending money on yourself feels either necessary therapy or irresponsible guilt.$$,
  $$You're practical and security-minded. You build slowly and steadily because you don't feel safe rushing. You're generous with those you love because you want them to have security too.$$,
  $$You can hoard or overspend emotionally. Loss of money feels catastrophic. You may confuse love with providing material things. Your attachment to possessions can be hard to release.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  3,
  $$Your emotions need expression through words. You think-feel simultaneously; processing happens through talking. Your childhood, family communications, and siblings shaped your emotional patterns. You're intuitive about people's unspoken feelings.$$,
  $$You talk a lot, especially about feelings and family. You need feedback and connection through conversation. You're probably the one who keeps family stories alive. You remember emotional details people forgot they told you.$$,
  $$You're an excellent listener because you feel what people are saying. You remember important details. Your curiosity about people's inner worlds is genuine, not clinical. You're good in helping professions or communication fields.$$,
  $$You can be repetitive or dwelling. You over-analyze relationships. You spread yourself thin emotionally, unable to say no to conversations. You might gossip when feeling vulnerable.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  4,
  $$Home is your emotional center. You need a safe nest to feel okay. Family ties are profound and sometimes complicated. Your past, your parents, your roots live in your body—they shape your emotional baseline.$$,
  $$You probably think about home constantly, whether it feels safe or not. You're protective of family and home turf. Childhood events replay emotionally in adulthood. Moving or losing a home disrupts you significantly.$$,
  $$You're a natural caregiver and homemaker. You create comfort for others. Your loyalty to family is real. You have good instincts about what people need emotionally.$$,
  $$You can be overly dependent on family approval. You may struggle leaving or staying away from home. Unresolved family stuff dominates your inner world. You might recreate childhood patterns without realizing it.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  5,
  $$Your emotions are creative and expressive. Feelings fuel your art, music, or self-expression. Pleasure and play are emotionally necessary, not indulgent. Your relationships need emotional resonance and you lead with heart.$$,
  $$You pursue things that feel good emotionally. Art, romance, or time with children give you real comfort. You're drawn to beauty. You experience things intensely and want to share that intensity.$$,
  $$You're genuinely warm in romance and relationships with children. You're playful and can access lightness. Your creativity comes from emotional truth, not technical perfection. People feel safe being vulnerable with you.$$,
  $$You can be moody or theatrical. You need external validation for your feelings to feel real. Romance can become obsessive. You might withdraw when you're not getting the emotional response you want.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  6,
  $$Your emotions manifest in your body and routines. Stress shows as physical symptoms. You need structure and daily rituals to feel emotionally grounded. Work and health are emotional issues; you can't separate them.$$,
  $$You're aware of your body and its signals constantly. You worry about health, sometimes excessively. You need routine because chaos makes you anxious. You feel responsible for others' wellbeing.$$,
  $$You're intuitively good at noticing health patterns—yours and others'. You're practical about self-care because it's emotional medicine, not vanity. You're steady and reliable in daily support.$$,
  $$You can be hypochondriac or overly focused on bodily sensations. You absorb others' stress physically. Disrupted routines destabilize you. You might use work to avoid emotional feelings.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  7,
  $$You need emotional intimacy in partnership. You're drawn to relationships as emotional nesting. Your partner's moods affect yours directly. Marriage or commitment feels emotionally essential, almost like survival.$$,
  $$You think about your relationships constantly. You're tuned into your partner's emotional state. You need reassurance that you're safe in the relationship. You can be clingy or reactive to perceived distance.$$,
  $$You're genuinely caring in partnership. You notice what your partner needs emotionally. You're not afraid of emotional connection. You create safe spaces for vulnerable conversations.$$,
  $$You can be dependent on partner approval. Conflict feels emotionally catastrophic. You may stay in unsafe dynamics because the emptiness of being alone feels worse. You might smother partners.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  8,
  $$Your emotions are intense and transformative. You feel things deeply and your feelings can remake you. Intimacy is emotional merger—you need to trust completely or not at all. Shared resources feel emotionally fraught.$$,
  $$You experience emotional extremes. You feel others' hidden emotions acutely. You're drawn to taboo subjects and shadow work. You worry about money and shared resources, sometimes obsessively.$$,
  $$You have deep emotional courage. You're willing to face your own shadow and help others face theirs. Your intuition about hidden dynamics is usually right. You love with intensity and commitment.$$,
  $$Your moods can be destructive when triggered. Betrayal feels like emotional annihilation. You can be controlling with partners because you need to manage safety. You may withhold emotionally as protection.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  9,
  $$Your emotions need meaning and context. You feel things but also interpret them philosophically. Travel and exploration soothe you emotionally. You're drawn to beliefs and traditions that help you understand your feelings.$$,
  $$You ask why you feel what you feel. You seek out learning and experiences that expand your perspective. You're probably drawn to spiritual or philosophical approaches to healing. Stagnation feels emotionally suffocating.$$,
  $$You're optimistic even when struggling emotionally. You believe in growth and meaning-making. You're drawn to teaching or sharing what you've learned. Your emotional wisdom comes from genuine seeking.$$,
  $$You can intellectualize feelings to avoid feeling them. You might be attracted to spiritual bypassing. Feeling stuck or limited emotionally can trigger restlessness. You may chase experiences trying to feel something real.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  10,
  $$Your emotions are tied to public image and career. You need to feel respected professionally to feel okay personally. Your mother or parental authority shaped your emotional patterns around achievement. Public recognition soothes you.$$,
  $$You're aware of what others think. You manage your image carefully. You feel responsible for your reputation. You worry about being seen as competent and respectable.$$,
  $$You're genuinely responsible and conscientious. You can hold authority without becoming cold. You're protective of people under your care. You understand that image and emotion aren't opposed.$$,
  $$You can be overly concerned with others' approval. You may sacrifice personal emotional truth for reputation. Career setbacks devastate you. You might suppress feelings in professional contexts, then explode privately.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  11,
  $$Your emotions are collective and group-oriented. You feel what groups feel. You need community and friendship for emotional safety. You're drawn to causes and movements that align emotionally. Belonging is emotional necessity.$$,
  $$You're attuned to group dynamics. You notice when the vibe is off. You probably have tight friend groups. You feel responsible for your community's wellbeing. You value loyalty highly.$$,
  $$You're genuinely good at group care and cohesion. People trust you as an emotional anchor. You hold space for others' feelings without judgment. You're comfortable with collective emotional processing.$$,
  $$You can lose yourself in group identity. Rejection from community feels emotionally devastating. You might have trouble with boundaries between your feelings and the group's. You can be codependent with friends.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Moon',
  12,
  $$Your emotions are private and internal. You feel deeply but show little on the surface. Your inner world is rich but hidden. Solitude is emotionally necessary; you process through withdrawal and reflection.$$,
  $$You're quiet emotionally, even in intimacy. Your feelings are complex and not easily explained. You probably cry or process alone. You're intuitive about others' unspoken feelings but don't share your own readily.$$,
  $$You have genuine emotional depth. You're not surface—there's always more underneath. You can hold space for others' pain without needing them to perform okayness. Your spirituality is emotionally grounded.$$,
  $$You can feel isolated and misunderstood. People may not know how much you're feeling. You might escape into fantasy when reality overwhelms you. You can struggle to ask for emotional support.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- MERCURY IN HOUSES (Communication, thinking, short journeys, learning)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  1,
  $$You are mentally restless and quick. Your mind is your primary tool. You think out loud and people are drawn to your perspective. Your identity is wrapped up in being clever, curious, or communicative.$$,
  $$You're rarely still. You notice details others miss. You probably talk fast or gesture while speaking. You're always learning about something new. People describe you as witty or mentally sharp.$$,
  $$You're genuinely intelligent and adaptable. You can learn new things quickly. You're not dogmatic—you change your mind when given better information. People trust your thinking because you're clearly engaged.$$,
  $$You can be scattered or unfocused. You start projects and move on without finishing. You might seem flaky because your attention shifts. You can talk too much without listening.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  2,
  $$Your thinking is practical and economical. You calculate and plan financially. Your mind works in concrete terms—you think about money, resources, and what has real value. Information about money interests you.$$,
  $$You probably read financial news or do calculations for fun. You negotiate without emotion. You're good with numbers and practical planning. You think several moves ahead about resources.$$,
  $$You're pragmatic and realistic. You don't get caught up in abstract ideas if they don't have practical use. You're excellent with contracts and agreements. You can spot financial problems before they manifest.$$,
  $$You can be overly focused on money's practical side, missing value in intangibles. You might nickel-and-dime or haggle too hard. You can be stingy with generosity because you think too much about cost.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  3,
  $$Communication is your primary mode. Your mind is sharp and your tongue is sharper. You love language, learning, and conversation. Siblings or early childhood communication patterns shape how you think today.$$,
  $$You write, talk, or analyze constantly. You're probably good at explanation and teaching. You notice what people say and what they don't. You have quick comebacks and good humor.$$,
  $$You're an excellent communicator and teacher. You make complex things simple. You're curious about diverse perspectives. Your humor is intelligent and doesn't require explanation.$$,
  $$You can be critical or sarcastic, cutting people accidentally. You talk over people or don't listen as well as you should. You can spread information carelessly or enjoy gossip. You might struggle with silence.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  4,
  $$Your thinking is rooted in family and history. You process through family stories and memories. Your mind works in patterns set by your childhood. You're interested in genealogy, family narratives, or home-related knowledge.$$,
  $$You think about your past a lot. Family stories are important to you. You probably communicate easily with family members. You're good at understanding family dynamics and narratives.$$,
  $$You're grounded in family wisdom. You understand context and history. Your thinking isn't abstract—it comes from lived experience. You're reliable in family communication or decision-making.$$,
  $$You can be stuck in family patterns of thinking. You might replay family conversations obsessively. You struggle to think independently of family influence. You can be overly focused on the past.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  5,
  $$Your thinking is creative and expressive. You come up with novel ideas and unconventional perspectives. Your mind is playful—you're good at wordplay, wit, and creative problem-solving. You think by making and creating.$$,
  $$You're always brainstorming or riffing on ideas. You're probably good at storytelling or creative writing. You enjoy being clever and showing it off. You think best when engaged with something fun.$$,
  $$You're genuinely creative and original. Your ideas feel fresh because you're not bound by convention. You're excellent at marketing or advertising because you understand appeal. You can make anything interesting through your perspective.$$,
  $$You can be impulsive with your words or ideas. You might over-promise or commit to projects without thinking through logistics. You can be dramatic in communication. Your need to be clever might interfere with being clear.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  6,
  $$Your thinking is analytical and detail-focused. You notice what's broken and think about how to fix it. Your mind is practical—you think about systems, processes, and daily operations. You're probably organized and good with data.$$,
  $$You spot problems others miss. You're probably frustrated by inefficiency. You likely organize your information and space. You think about health and wellness from a practical angle.$$,
  $$You're genuinely good at analysis and troubleshooting. You're reliable in work that requires precision. You can improve processes systematically. You think clearly under pressure.$$,
  $$You can be overly critical of yourself and others. You get stuck in details and miss the big picture. You might be annoying about inefficiency. You can overthink simple situations.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  7,
  $$Your thinking thrives in partnership. You need to talk things through with someone else to clarify your thoughts. Negotiation and communication are your strengths. You're interested in other people's perspectives.$$,
  $$You're aware of your partner's perspective constantly. You probably discuss things a lot. You notice communication patterns in relationships. You're good at seeing both sides.$$,
  $$You're genuinely diplomatic and fair-minded. You can hold space for different perspectives without needing everyone to agree with you. You're excellent in mediation or negotiation roles.$$,
  $$You can be indecisive because you see too many angles. You might use conversation to avoid decision-making. You can be overly focused on others' thoughts at the expense of your own clarity.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  8,
  $$Your thinking probes beneath the surface. You're drawn to psychology, hidden dynamics, and complex truths. You notice what people don't say. Your mind works in layers—nothing is simple on the surface.$$,
  $$You think about taboo subjects without flinching. You're fascinated by psychology or transformation. You notice power dynamics and unspoken tensions. You probably research obsessively when something interests you.$$,
  $$You have genuine insight into hidden patterns. People's secrets feel safe with you because you don't judge. You're good at research and digging into complexity. You understand nuance and subtext.$$,
  $$You can be paranoid or suspiciously minded. You might read hidden meaning into everything. You can get obsessed with figuring people out. You might use your insight to manipulate.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  9,
  $$Your thinking is expansive and philosophical. You think in big-picture frameworks and belief systems. You're drawn to higher learning, language, and cross-cultural perspectives. Your mind searches for meaning.$$,
  $$You probably love reading and learning. You're interested in philosophy, religion, or cultural studies. You have opinions about how the world should work. You get excited by new ideas.$$,
  $$You're genuinely open-minded and intellectually curious. You're good at explaining complex ideas. You're enthusiastic about learning and sharing knowledge. You think globally, not just locally.$$,
  $$You can be preachy or condescending about your beliefs. You might care more about the idea than the evidence. You can be restless—always looking for the next interesting concept. You might not follow through on practical thinking.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  10,
  $$Your thinking is professional and strategic. You think about reputation and how your words land publicly. Your mind is directed toward career success. You're probably good at public speaking or professional communication.$$,
  $$You think about what you say in professional contexts. You're aware of how you're perceived. You probably have professional expertise you're known for. You think strategically about career moves.$$,
  $$You're genuinely effective in professional communication. You're clear and authoritative without being arrogant. You're good at explaining complex information to decision-makers. You think long-term strategically.$$,
  $$You can be overly concerned with how you're perceived. You might censor yourself too much. You can be calculating rather than authentic. You might not allow vulnerability in professional spaces.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  11,
  $$Your thinking is collective and networked. You're interested in group dynamics, movements, and shared ideas. Your mind works through connection to others' thinking. You're drawn to communities of thought.$$,
  $$You're probably active in groups or networks. You enjoy debate and idea exchange. You're interested in collective movements and social progress. You communicate well in group settings.$$,
  $$You're genuinely good at collaborative thinking. You can hold space for diverse opinions. You're excellent at networking because you actually care about ideas, not just advantage. You inspire group thinking.$$,
  $$You can be easily influenced by group think. You might change your opinions too readily to fit in. You might avoid your own thinking if it contradicts the group. You can spread information without verifying.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mercury',
  12,
  $$Your thinking is subtle and internal. You notice things others miss because you're not distracted by obvious noise. Your mind works in symbols, dreams, and intuitive leaps. You think but don't always voice.$$,
  $$You probably have rich inner monologues. You're interested in spirituality or psychology. You notice patterns and synchronicities. You might write or create, but keep it private.$$,
  $$You have genuine intuitive intelligence. Your insights come from combining subtle information. You're not distracted by noise or convention. You can help people understand their own hidden thinking.$$,
  $$You can be vague or hard to understand when you finally do speak. You might overthink or spiral mentally. You can struggle to communicate what you know. You might assume others understand you when they don't.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- VENUS IN HOUSES (Love, values, beauty, desire, money)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  1,
  $$You are magnetic and naturally attractive. People are drawn to your presence without you trying. You have good taste and carry yourself with natural grace. Your identity is partly built on being appealing and valued.$$,
  $$You're aware of how you look and how you're perceived. You probably take time with appearance because it matters to you. You attract people easily. You have an ease in social situations.$$,
  $$You're genuinely likeable without being fake. You have natural charm that comes from comfort with yourself. People enjoy being around you. You value beauty and aesthetics in life.$$,
  $$You can be overly focused on being liked or attractive. You might make decisions based on what others will think. You can struggle with aging or anything that threatens your appeal. You might be vain.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  2,
  $$You value comfort and beautiful things. You want money not for power but for pleasure and security. You have excellent taste and like quality. You may spend on luxury or comfort items because they bring real joy.$$,
  $$You think about your material comfort regularly. You appreciate nice things and probably have good taste. You like money because it buys freedom and pleasure. You're drawn to abundance.$$,
  $$You're genuinely good at creating beauty around you. Your aesthetic sense is real, not pretentious. You enjoy sensuality—food, comfort, nice textures. You're not anxious about money in the same way others are.$$,
  $$You can be overly indulgent or self-indulgent with spending. You might prioritize comfort over actual needs. You can be lazy about financial management because you trust it will work out. You might be materialistic.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  3,
  $$You are charming and genuinely interested in people. You like learning about what others think and feel. Your communication style is warm and people enjoy talking with you. You value connection and conversation.$$,
  $$You probably have lots of friends or acquaintances. You enjoy texting, calling, or hanging out casually. You're interested in gossip not maliciously but from genuine curiosity about people. You like light, pleasant interaction.$$,
  $$You're genuinely good at making people feel valued. You remember details about people's lives. Your interest in others is authentic. You're excellent in roles involving communication or customer service.$$,
  $$You can be superficial—interested in connection without real depth. You might flirt or charm unnecessarily. You can spread yourself thin across many shallow friendships. You might be indiscreet.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  4,
  $$You love home and family deeply. You want to create beauty and comfort in your domestic space. Family relationships are important to your sense of belonging. You're maternal or nurturing, or you seek that in others.$$,
  $$You spend time and money on your home. You probably care about how it looks and feels. Family members matter deeply to you—both biological and chosen. You host or gather people.$$,
  $$You're genuinely warm in family roles. You create comfort and beauty in your home. You're loyal to family. You have natural nurturing instincts that feel good to you.$$,
  $$You can be overly dependent on family approval. You might stay in family situations too long out of loyalty. You can struggle to leave home because attachment is so strong. You might enable family members.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  5,
  $$You love romance, creativity, and pleasure. You're drawn to beauty and self-expression. You fall in love easily and fall hard. Creativity and joy are essential to your wellbeing, not luxuries.$$,
  $$You're probably in or seeking romantic connection. You enjoy pleasure—sex, art, adventure, fun. You're creative with how you show affection. You think life should be enjoyable.$$,
  $$You're genuinely warm and affectionate. Your creativity comes from authentic joy. You make others feel beautiful and valued. You're not afraid of passion or intensity.$$,
  $$You can be needy in romance or overly dramatic. You might pursue pleasure at the expense of responsibility. You can be possessive or jealous. You struggle with boredom.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  6,
  $$You like to be helpful and appreciated. You find meaning and pleasure in service. You value health and wellness as expressions of self-care and respect. Small acts of kindness matter to you deeply.$$,
  $$You're probably drawn to helping professions or service roles. You appreciate being valued for your competence. You like to organize and improve things. You care about your health because you respect yourself.$$,
  $$You're genuinely kind in how you help. You're not resentful about service—it feels good to you. Your standards are high but you apply them to yourself too. You improve situations through grace, not force.$$,
  $$You can feel undervalued or taken advantage of. You might give too much of yourself away. You can be critical of yourself if you're not "enough." You might martyr yourself.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  7,
  $$Partnership is essential to you. You need romantic love to feel complete. You're drawn to beauty in people and relationships are where you invest your energy. Marriage or commitment feels beautiful and right.$$,
  $$You think about romance and partnership constantly. You're drawn to beautiful or charismatic partners. You invest heavily in relationships. You need affection and partnership.$$,
  $$You're genuinely loving and committed. You bring grace to partnership. You're not afraid of intimacy or vulnerability. You make your partner feel valued and beautiful.$$,
  $$You can lose yourself in relationship. You might compromise too much to maintain harmony. You can be codependent or fear being alone. You might stay in poor relationships for connection.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  8,
  $$You love intensely and without reservation. You're drawn to deep intimacy and transformation through relationship. You value shared resources and emotional merging. Love feels like redemption or death—nothing small.$$,
  $$You probably experience love as overwhelming. You're drawn to intense or complex partners. You care deeply about loyalty and shared resources. You think about past loves or losses significantly.$$,
  $$You love with real depth and commitment. You're not afraid of intense feelings or complicated situations. You can transform through love. You're loyal even when it's hard.$$,
  $$You can be obsessive or possessive in love. You might use control as protection. You can be devastated by betrayal. You might attract complicated or unavailable partners.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  9,
  $$You love adventure, growth, and expansion. You're attracted to people who challenge or teach you. You value philosophy and shared vision in relationships. Travel and exploration feel romantic.$$,
  $$You're drawn to partners who are different or foreign in some way. You probably enjoy travel and adventure. You value intellectual and philosophical connection. You get bored with stagnation.$$,
  $$You're genuinely enthusiastic and optimistic in love. You make partners feel like partners in adventure. You value growth and mutual expansion. You're not clingy because you trust.$$,
  $$You can be commitment-phobic or always looking for the next adventure. You might pursue freedom over intimate connection. You can be unrealistic about love. You might run from real relationship complexity.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  10,
  $$You care about status and how your relationships appear. You're drawn to partners who enhance your reputation or share your ambitions. Beautiful success is important—both professionally and romantically.$$,
  $$You're aware of how relationships look to others. You're probably drawn to accomplished or attractive partners. You care about your image as a couple. You think about long-term partnership seriously.$$,
  $$You're genuinely responsible in partnership. You want beautiful success and you work for it. You're not superficial, but you do appreciate quality. You're loyal and steady.$$,
  $$You can be overly concerned with appearances. You might stay in relationships for status. You can be cold or calculated about partnership. You might struggle with vulnerability.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  11,
  $$You love community and friendship deeply. You value people for their uniqueness and vision. You're drawn to groups working toward shared ideals. Love is woven into your community connections.$$,
  $$You probably have many friends or active community involvement. You value loyalty and shared values. You're attracted to people who share your ideals. You enjoy group activities and belonging.$$,
  $$You're genuinely good at friendship and community building. You're inclusive and value diversity. You attract quality people because you value them. You're loyal to your communities.$$,
  $$You can be conflict-avoidant to preserve relationships. You might struggle with exclusive commitment if it means leaving groups. You can spread yourself too thin. You might care more about the group than individuals.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Venus',
  12,
  $$You love quietly and often secretly. Your values are private and your affection hidden. You're attracted to beauty that others might not see. Love feels spiritual or transcendent rather than worldly.$$,
  $$You probably don't advertise your relationships. You're drawn to private or spiritual connection. You might love people you don't pursue openly. Your aesthetics are refined but hidden.$$,
  $$Your love is genuine and not performed. You see beauty in what's overlooked. You're not possessive because love feels transcendent to you. You're loyal in ways only close people know.$$,
  $$You can be avoidant or unable to claim your love. You might put people on pedestals. You can be disconnected from sensuality or pleasure. You might martyr your needs.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- MARS IN HOUSES (Drive, action, sexuality, aggression, courage)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  1,
  $$You move through life with directness and force. You're driven and energetic, sometimes aggressive. People know not to mess with you. Your identity is built on being strong, capable, and willing to fight.$$,
  $$You're probably competitive. You take initiative and move fast. You're direct in your communication. You have physical energy and restlessness.$$,
  $$You're genuinely brave and willing to take on challenges. You're not afraid of conflict or competition. You inspire people through your confidence. You accomplish things because you push forward.$$,
  $$You can be aggressive or overly blunt. You might bulldoze over people's feelings. You struggle with patience. You can be combative or angry.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  2,
  $$You pursue security fiercely. You're driven to build and defend resources. You work hard because financial independence is essential. You fight for what's yours.$$,
  $$You're probably motivated by money and security. You pursue resources aggressively. You're possessive of what you own. You don't give things up easily.$$,
  $$You're genuinely driven to succeed financially. You're not lazy about building wealth. You can protect what's yours effectively. You have real resourcefulness.$$,
  $$You can be overly aggressive about money or possessions. You might be greedy or controlling with resources. You can be stubborn about financial matters. You might fight unnecessarily about money.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  3,
  $$Your words are weapons. You're argumentative and quick to debate. Your mind is sharp and you use it aggressively. Communication is your arena for competition.$$,
  $$You probably argue easily. You enjoy debate and intellectual sparring. You're quick-witted and can cut with words. You're probably loud or talk over people.$$,
  $$You're genuinely intelligent and articulate. You're not afraid to speak up or defend your position. You can think fast under pressure. You're excellent in argument or debate.$$,
  $$You can be mean-spirited in communication. You might hurt people with your words without realizing it. You can be disruptive or argumentative for sport. You don't listen well.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  4,
  $$You fight for family and home. You're protective and territorial. Your energy is directed toward creating and defending safe space. You're the warrior for your family's wellbeing.$$,
  $$You're probably protective of family. You take action quickly if family is threatened. You might be argumentative with family members. You're active in improving your home.$$,
  $$You're genuinely protective and loyal. You create safety through your willingness to fight. You take family responsibilities seriously. You improve and protect your home.$$,
  $$You can be controlling or dominating in family. You might fight with family members too readily. You can be overly protective or smothering. You might struggle with leaving home.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  5,
  $$You pursue passion and pleasure aggressively. You're driven sexually and romantically. You take risks for what excites you. Your creative energy is high and you pursue projects with force.$$,
  $$You're probably passionate in romance. You pursue what you desire without much hesitation. You're probably sexual and unashamed. You take creative risks.$$,
  $$You're genuinely bold in pursuing what you want. Your passion is infectious. You're not inhibited or passive. You inspire others through your aliveness.$$,
  $$You can be impulsive or reckless in romance. You might pursue unavailable people. You can be aggressive sexually or romantically. You get bored and move on easily.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  6,
  $$Your drive is channeled into work and mastery. You're driven to improve systems and build competence. You work hard and take pride in accomplishment. You need work to feel alive.$$,
  $$You're probably busy and productive. You're driven at work and take it seriously. You notice inefficiencies and work to fix them. You're probably frustrated by laziness.$$,
  $$You're genuinely effective and driven. You accomplish things through consistent action. You're not afraid of hard work. You improve processes and systems.$$,
  $$You can be aggressive or controlling at work. You might push yourself too hard. You can be overly critical. You struggle to rest.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  7,
  $$You fight in relationship. You're passionate about partnership and also combative. You pursue what you want but you're willing to compete. Conflict is part of how you relate.$$,
  $$You're probably passionate with partners. You might argue frequently. You pursue your partner actively. You're not passive in relationships.$$,
  $$You're genuinely passionate and not inhibited. You don't let things fester—you address them. You're willing to fight for relationships. You're sexually alive.$$,
  $$You can be too combative in partnership. You might start arguments unnecessarily. You can overpower partners. You struggle with compromise.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  8,
  $$You're driven by power and transformation. You pursue deep intimacy with force. You're not afraid of darkness or intensity. You fight for control in shared situations.$$,
  $$You're probably intense in intimate relationships. You're drawn to power dynamics. You pursue transformation actively. You're not squeamish about taboo.$$,
  $$You're genuinely courageous about difficult things. You're willing to go deep. You don't shy away from complexity or darkness. You're powerful.$$,
  $$You can be controlling or manipulative. You might pursue power aggressively. You can be destructive when triggered. You might be obsessive.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  9,
  $$You pursue knowledge and truth aggressively. You fight for your beliefs. You're driven to expand your understanding. You take adventure and exploration seriously.$$,
  $$You're probably opinionated about your beliefs. You might argue about philosophy or religion. You pursue learning actively. You're drawn to physical adventure.$$,
  $$You're genuinely courageous in pursuing truth. You're not afraid to challenge assumptions. You inspire others through your conviction. You're willing to go on real quests.$$,
  $$You can be preachy or aggressive about beliefs. You might judge others' perspectives harshly. You can be reckless in pursuit of adventure. You're not always right.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  10,
  $$You're driven to achieve and gain power. Your ambitions are strong and you pursue them aggressively. Success is important and you work hard for it. You're competitive professionally.$$,
  $$You're probably ambitious and driven at work. You compete for position and advancement. You're active in pursuing career goals. You're aware of hierarchy.$$,
  $$You're genuinely driven and accomplishment-oriented. You're not afraid to pursue what you want professionally. You inspire through action. You don't give up.$$,
  $$You can be too aggressive or controlling professionally. You might overwhelm colleagues. You can prioritize advancement over relationships. You're combative about authority.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  11,
  $$You drive your group toward goals. You're active in communities and probably take leadership roles. You pursue shared ideals forcefully. You're energized by group action.$$,
  $$You're probably active in groups or causes. You take initiative in team situations. You're competitive in group contexts. You pursue group goals aggressively.$$,
  $$You're genuinely good at mobilizing groups. You inspire action. You're not passive in community. You pursue shared ideals with force.$$,
  $$You can be dominating in groups. You might not listen to others' perspectives. You can be aggressive about your group's agenda. You might create conflict.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Mars',
  12,
  $$Your drive is hidden or spiritual. You pursue transcendence or truth quietly. Your energy goes inward—meditation, healing work, or internal battles. You're courageous about facing your shadow.$$,
  $$You're probably quiet but intense underneath. You pursue spiritual or internal goals. You notice inner conflicts. You might struggle with how to express your drive.$$,
  $$You're genuinely courageous internally. You face your shadow without flinching. You pursue spiritual goals with real commitment. You inspire through quiet action.$$,
  $$You can be bottled up or explosive. You might struggle to claim your power. You can be self-sabotaging. You might isolate yourself.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- JUPITER IN HOUSES (Growth, luck, expansion, belief, hope)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  1,
  $$You're fortunate and expansive. People like you and opportunities come your way. You're optimistic naturally and it attracts good things. Your identity is tied to growth and possibility.$$,
  $$You're probably upbeat and enthusiastic. People gravitate toward your energy. You expect good things and usually experience them. You're naturally lucky.$$,
  $$You're genuinely optimistic without being naive. You inspire others through your belief in possibility. You're willing to take calculated risks. Good opportunities really do find you.$$,
  $$You can be overly optimistic or lazy because things come easily. You might take things for granted. You can be pompous or think too highly of yourself. You might overextend yourself.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  2,
  $$You're fortunate financially. Money comes relatively easily and you tend to grow what you have. You're generous and believe abundance will return. Resources feel expansive and available.$$,
  $$You're probably fairly secure financially. Money flows to you. You spend generously. You believe in abundance. You probably experience material growth over time.$$,
  $$You're genuinely generous and not anxious about resources. You attract abundance through belief and action. You're good at growing what you have. You're not stingy.$$,
  $$You can be overly trusting about money and insufficiently careful. You might overspend or overcommit financially. You can be wasteful. You might attract financial complications through carelessness.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  3,
  $$Your mind is optimistic and expansive. You're interested in learning and you're good at it. You communicate well and people enjoy listening to you. You see possibility in ideas.$$,
  $$You probably love learning. You're probably well-read. You communicate enthusiastically. You're probably good at teaching or explaining. You see potential in ideas and people.$$,
  $$You're genuinely intelligent and well-informed. You make learning fun. You're not pedantic—you communicate with genuine enthusiasm. You inspire intellectual growth in others.$$,
  $$You can talk too much and not listen enough. You might be overly opinionated. You can oversimplify complex things. You might promise more than you deliver.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  4,
  $$Your home is expansive and welcoming. Family is fortunate and grows together. You feel lucky in family relationships. Your roots are strong and provide security.$$,
  $$You probably come from a fortunate family or build one. Your home is open and abundant. Family members support each other. You feel belonging and security.$$,
  $$You're genuinely warm in family roles. You expand what's possible for your family. You create abundance and generosity in home. Family relationships feel blessed.$$,
  $$You can be overly indulgent in family. You might spoil or enable family members. You can be naively trusting. You might avoid necessary boundaries.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  5,
  $$You're fortunate in love and creativity. Pleasure and joy are available to you. You're generous in romance and creating. You believe in the best in people and they respond.$$,
  $$You probably fall in love easily or attract romantic interest. You pursue creative projects with enthusiasm. You're generous with affection and attention. You enjoy pleasure without guilt.$$,
  $$You're genuinely warm and generous in love. Your creativity comes from genuine joy. You inspire others to believe in possibility. You're not inhibited.$$,
  $$You can be overly indulgent or excessive. You might pursue pleasure at the expense of responsibility. You can be naive in romance. You might overcommit emotionally.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  6,
  $$You're fortunate in health and work. You're naturally healthy or recover well. Your work is meaningful and you're appreciated. You're generous in service. Daily life feels abundant.$$,
  $$You're probably healthy or develop good health habits easily. Your work feels purposeful. You're good at helping others. You probably feel fortunate in daily life.$$,
  $$You're genuinely good at improving situations. Your optimism helps you stay healthy. You inspire others through your service. You're not resentful about work.$$,
  $$You can be lazy about health or work, assuming things will work out. You might be overly critical of others' efforts. You can be self-righteous about service.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  7,
  $$You're fortunate in partnership. You attract good partners and relationships grow well. You're generous in relationship. Marriage or commitment feels blessed. People want to commit to you.$$,
  $$You probably have good relationships. You're generous with partners. People want to partner with you. You believe in partnership working and it usually does.$$,
  $$You're genuinely generous and optimistic in partnership. You bring out the best in partners. Relationships grow under your care. You're not petty.$$,
  $$You can be naively trusting in partnership. You might overlook problems. You can be overly dependent on partnership. You might attract people who take advantage.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  8,
  $$You're fortunate with shared resources and inheritance. Transformations tend to work out in your favor. You're generous in intimacy and psychological work. Deep connections bring growth.$$,
  $$You probably experience luck with inheritance or other people's resources. Shared finances tend to work well. You're generous with intimacy. Transformations improve your life.$$,
  $$You're genuinely generous in deep relationships. You support others' transformations. You're not afraid of depth or intensity. Shared resources work well.$$,
  $$You can be naively trusting about others' financial good faith. You might be overly indulgent or dependent. You can minimize legitimate concerns.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  9,
  $$You're fortunate in travel and higher learning. Opportunities for expansion come your way. You're drawn to philosophy and meaning. Your beliefs expand your life. The world is welcoming.$$,
  $$You probably travel or want to. Learning feels natural and opportunities appear. You have strong beliefs that guide you. You seek meaning and usually find it.$$,
  $$You're genuinely interested in growth and expansion. You inspire others through your beliefs. You're fortunate in opportunities that expand your world. You're not limited by fear.$$,
  $$You can be overly optimistic about possibilities. You might bite off more than you can chew. Your beliefs might become dogmatic. You can be reckless.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  10,
  $$You're fortunate professionally and publicly. Career opportunities come your way. Your reputation is good and grows. People believe in your potential. Success comes relatively easily.$$,
  $$You probably experience career growth and opportunity. People see your potential and promote it. Your reputation is positive. Success feels natural.$$,
  $$You're genuinely good at what you do and people recognize it. You inspire through your belief in possibility. Career growth happens relatively easily. You're generous in leadership.$$,
  $$You can be overconfident professionally. You might rely on luck too much. You can make promises you don't keep. You might plateau without continued effort.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  11,
  $$You're fortunate in community and friendships. Your networks are strong and expanding. Groups and causes thrive when you're involved. You attract quality people. Belonging comes easily.$$,
  $$You probably have large networks. You make friends easily. Groups thrive with your involvement. You believe in causes and support them. Community feels natural.$$,
  $$You're genuinely good at bringing people together. Your optimism about possibility inspires groups. You attract quality friendships. You're generous with your network.$$,
  $$You can be overly trusting of groups or causes. You might spread yourself too thin socially. You can be naive about group dynamics. You might overlook problems in communities.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Jupiter',
  12,
  $$You're fortunate spiritually and internally. You have faith and it carries you. Your spiritual journey brings growth. Hidden gifts reveal themselves. Meaning is found through solitude.$$,
  $$You probably have spiritual beliefs or practices. Inner work brings real growth. You experience synchronicity or grace. Solitude feels restorative.$$,
  $$You're genuinely spiritual without being preachy. Your faith is real and sustaining. You inspire others through quiet example. Meaning unfolds naturally.$$,
  $$You can be overly idealistic spiritually. You might use spirituality to avoid reality. You can be naively trusting about people. You might minimize real problems.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- SATURN IN HOUSES (Limitations, structure, responsibility, fear, karma)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  1,
  $$You take yourself seriously. You're cautious and you build slowly. Your identity is bound to discipline and responsibility. You don't expect things to come easy. You're reliable but sometimes grim.$$,
  $$You're probably reserved or serious. You move carefully. You're conscious of doing things right. You're probably harder on yourself than others.$$,
  $$You're genuinely responsible and dependable. You don't make promises lightly. You build real capacity over time. People trust you because you follow through.$$,
  $$You can be overly serious or lacking fun. You might be too hard on yourself. You can feel like you're always behind or not enough. You struggle with self-criticism.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  2,
  $$You build wealth slowly and carefully. You're responsible about money and scared of running out. You work hard because security feels conditional. Your value is tied to what you can demonstrate materially.$$,
  $$You're probably careful with money. You work steadily to build resources. You worry about security. You're probably disciplined about finances.$$,
  $$You're genuinely responsible with money and build real security. You're not reckless. You understand that wealth takes time. You're reliable financially.$$,
  $$You can be overly stingy or withholding. You might be anxious about resources despite having them. You can't enjoy what you have because you're afraid of losing it. You might deprive yourself.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  3,
  $$Your thinking is serious and disciplined. You're careful with words. Your mind works through structure and systems. You're probably good at research and methodology.$$,
  $$You probably think carefully before speaking. You're drawn to structured learning. You're good at systems thinking. You're somewhat reserved in communication.$$,
  $$You're genuinely thoughtful and precise. You communicate clearly because you think carefully. You're good at explaining complex systems. You're reliable in your thinking.$$,
  $$You can be overly cautious in communication. You might withhold information. You can be cold or impersonal. You might struggle with small talk.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  4,
  $$Home and family are serious responsibilities. You're bound by duty to family. Your past is heavy or difficult and shapes you. You're building security but it feels like it takes forever.$$,
  $$You probably feel responsibility to family. Your childhood had lessons or challenges. You work to create a secure home. You're probably serious about family obligations.$$,
  $$You're genuinely loyal and responsible to family. You create real stability through effort. You don't shirk responsibilities. You're the steady one people rely on.$$,
  $$You can feel burdened by family. You might resent obligations. You can struggle to leave home or assert independence. You might replay childhood pain.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  5,
  $$Your creative expression is disciplined and controlled. You're careful with your heart in romance. Children or creative projects are serious responsibilities. Joy feels earned, not freely given.$$,
  $$You're probably reserved romantically. You're cautious about commitment or expression. Creativity feels work-like. You take parenting or creation very seriously.$$,
  $$You're genuinely committed when you do give your heart. Your creativity has real substance because it's disciplined. You're responsible with others' hearts. You follow through on creative projects.$$,
  $$You can be cold or withholding romantically. You might deny yourself pleasure. You can be overly serious about fun. You might struggle to let loose.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  6,
  $$You're disciplined about work and health. You're responsible and reliable professionally. You build real competence through effort. Your body needs structure and consistency to stay healthy.$$,
  $$You probably work hard and steadily. You're good at structured tasks. You're careful about health. You're probably disciplined about routines.$$,
  $$You're genuinely reliable and competent. You build real skills through practice. You don't cut corners. People trust your work ethic.$$,
  $$You can be overly rigid about routines or work. You might be hard on yourself or others. You can develop anxiety about health. You might work too much.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  7,
  $$Partnership is serious and long-term for you. You're committed but cautious. Marriage feels like a real responsibility. You choose carefully because you're in for the long haul.$$,
  $$You probably take relationships seriously. You're cautious about commitment but loyal. You work on relationships despite difficulty. You probably marry for real, not lightly.$$,
  $$You're genuinely loyal and committed. You don't leave when things get hard. You're realistic about partnership and work accordingly. People trust your commitment.$$,
  $$You can be cold or overly serious in partnership. You might hold yourself back emotionally. You can struggle with vulnerability. You might stay in bad situations out of obligation.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  8,
  $$Deep connection is serious business. You're cautious about intimacy and shared resources. You work through transformation but it's slow. Taboo subjects are approached methodically, not emotionally.$$,
  $$You're probably reserved about sharing deeply. You worry about trust and betrayal. You're careful with shared finances. You approach transformation gradually.$$,
  $$You're genuinely capable of real depth over time. You don't rush intimacy. You're responsible with shared resources. You're realistic about human nature.$$,
  $$You can be overly suspicious or controlling. You might withhold intimacy. You can struggle to trust. You might make shared situations overly complicated.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  9,
  $$Your beliefs are grounded and hard-won. You don't adopt philosophies lightly. Travel and learning require real planning. You're skeptical and want proof before believing.$$,
  $$You probably don't believe things easily. You're drawn to practical philosophy. Learning is steady and methodical. You're probably skeptical of spiritual claims.$$,
  $$You're genuinely thoughtful about beliefs. You're not swept up by trends. Your philosophy is grounded in experience. You respect knowledge that's been tested.$$,
  $$You can be overly skeptical or cynical. You might dismiss possibilities without good reason. You can be rigid about beliefs. You might miss meaning trying to be practical.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  10,
  $$Career and reputation are serious. You build slowly and expect to work hard. Your ambitions are real but patient. You're responsible in authority and gain respect through competence.$$,
  $$You probably work steadily toward career goals. You're responsible in your position. You build reputation through reliability. You're patient about advancement.$$,
  $$You're genuinely capable and reliable professionally. People trust your work. You don't cut corners or make excuses. You build real authority over time.$$,
  $$You can be overly focused on career advancement. You might be cold or impersonal professionally. You can struggle with work-life balance. You might be overly concerned with hierarchy.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  11,
  $$Community involvement is serious and lasting. You're loyal to groups but cautious about commitment. You take collective responsibility seriously. Friendship is real but carefully chosen.$$,
  $$You probably have solid friend groups. You're careful about belonging or commitment. You're responsible in group roles. You don't spread yourself thin socially.$$,
  $$You're genuinely reliable in community roles. You follow through on group commitments. You're stable in friendships. You're not a flake.$$,
  $$You can be overly serious in social situations. You might struggle with spontaneity. You can be judgmental about how people act in groups. You might feel like an outsider.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Saturn',
  12,
  $$Your spiritual path is serious and disciplined. Solitude is necessary but can feel isolating. Your inner work is real and takes real effort. You face your shadow methodically.$$,
  $$You probably have a real spiritual practice or discipline. Solitude feels important. You're probably introspective and self-aware. You work on your issues.$$,
  $$You're genuinely capable of deep inner work. You don't shy away from your shadow. Your spirituality is grounded, not escapist. You're disciplined in your practice.$$,
  $$You can feel isolated or depressed in solitude. You might be overly self-critical. You can struggle with faith or meaning. You might use work to avoid inner life.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- URANUS IN HOUSES (Change, rebellion, innovation, disruption, freedom)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  1,
  $$You don't fit in. Your identity is unconventional or you're actively rebelling against convention. You're drawn to change and innovation. People don't quite know what to expect from you.$$,
  $$You probably stand out. You're probably not interested in doing things the way they've always been done. You change yourself regularly. You surprise people.$$,
  $$You're genuinely original. You're not bound by "how things are done." You inspire innovation through your willingness to be different. You adapt quickly to change.$$,
  $$You can be erratic or unstable. You might rebel just for the sake of it. You can't hold a consistent image. You might alienate people through constant change.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  2,
  $$Your financial life is unpredictable. You don't follow conventional paths to security. You might experience sudden windfalls or losses. You're not materialistic or you reject materialism completely.$$,
  $$Your money situation is probably erratic. You don't follow traditional career paths. You might resist materialism. You probably make unconventional financial choices.$$,
  $$You're genuinely open to unconventional income sources. You don't need to play it safe financially. You're innovative about earning and resources. You're not enslaved to money.$$,
  $$You can be irresponsible with money. You might not save or plan sufficiently. Financial instability might stress others relying on you. You might reject legitimate financial concerns.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  3,
  $$Your thinking is unconventional and ahead of the curve. You come up with novel ideas. You probably talk about weird topics. Your communication style is unique and can be shocking.$$,
  $$You probably have unusual interests or ideas. You say things that make people uncomfortable. You're drawn to new information and technology. You think differently than most people.$$,
  $$You're genuinely innovative and original in thinking. You see possibilities others miss. You're not bound by conventional wisdom. Your ideas often turn out prescient.$$,
  $$You can be hard to understand or too far ahead of people. You might not listen as well as you should. You can be scattered in communication. You might alienate through your intensity.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  4,
  $$Home and family are disrupted regularly. You're probably different from your family. You might reject family traditions or rebel against them. Your home situation changes unexpectedly.$$,
  $$Your family relationships are probably unconventional. You might have an unusual living situation. Family traditions don't stick with you. You probably rebel against family expectations.$$,
  $$You're genuinely independent from family patterns. You create your own traditions. You're not bound by family expectations. You're willing to do things differently.$$,
  $$You can be rebellious or rejecting toward family. You might create instability in your home. You can struggle to feel grounded. You might distance yourself from family unnecessarily.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  5,
  $$Your romance and creativity are unconventional. You're drawn to unusual partners or unusual relationships. Your creative expression is unique. You're probably bored by conventional romance or art.$$,
  $$Your love life is probably unusual. You might have unconventional relationship styles. Your creativity is original and weird. You get bored with conventional fun.$$,
  $$You're genuinely original creatively. You inspire through breaking rules. Your relationships are based on authenticity, not convention. You're not afraid of unusual love.$$,
  $$You can be commitment-phobic or afraid of real intimacy. You might use "uniqueness" as distance. You can be erratic in romance. You might not follow through on creative projects.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  6,
  $$Your work life is unconventional. You probably don't fit corporate structures well. You're drawn to unusual jobs or innovating how work gets done. Health approaches are probably off-beat.$$,
  $$You probably have an unusual job or work style. You resist traditional workplace structures. You're drawn to innovation at work. Your health practices are probably unconventional.$$,
  $$You're genuinely good at innovating systems and processes. You're not bound by "how things are done." You inspire change in workplaces. You're flexible about health and wellness.$$,
  $$You can be rebellious about reasonable structure. You might not finish projects. You can struggle with routine work. You might make changes without thinking through consequences.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  7,
  $$Partnership is unconventional for you. You might have unusual relationship structures or be drawn to unusual partners. You need freedom within partnership. Traditional marriage might feel suffocating.$$,
  $$Your relationships are probably unconventional. You might have open arrangements or non-traditional structures. You need significant independence. You probably rebel against couple norms.$$,
  $$You're genuinely open to different relationship styles. You need authenticity over convention. You inspire partners through your refusal to fake. You support others' authenticity.$$,
  $$You can be afraid of real commitment. You might use "unconventionality" to maintain distance. You can be erratic. You might hurt partners through constant questioning of the relationship.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  8,
  $$Deep intimacy is complicated and unusual for you. You're drawn to taboo or unconventional aspects of sexuality. Shared resources undergo disruption. Transformation happens suddenly and unexpectedly.$$,
  $$Your intimate relationships are probably intense and unusual. You're not comfortable with conventional intimacy. Shared finances are probably complicated. Transformation happens suddenly.$$,
  $$You're genuinely open to unconventional intimacy. You're not bound by sexual norms. You inspire authenticity in partners. You're capable of real change.$$,
  $$You can be emotionally detached during intimacy. You might use unconventionality to avoid real engagement. You can be unpredictable with shared resources. You might sabotage closeness.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  9,
  $$Your beliefs are unconventional and probably changing. You reject traditional religion or philosophy. You're drawn to new-age or fringe ideas. Your world view is expanding and reforming constantly.$$,
  $$You probably have unusual beliefs or are exploring them. You reject traditional religion. You're drawn to new or unconventional spirituality. Your worldview is always evolving.$$,
  $$You're genuinely open to diverse perspectives. You're not bound by dogma. You inspire others to question assumptions. Your spiritual curiosity is real.$$,
  $$You can be overly drawn to fringe ideas. You might lack grounding in wisdom traditions. You can change beliefs too readily. You might alienate people through your intensity.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  10,
  $$Your career is unconventional or disrupted regularly. You probably don't follow traditional career paths. Your reputation is unusual or surprising. Public life changes unexpectedly.$$,
  $$Your career is probably not traditional. You might change careers unexpectedly. Your professional reputation is unusual. You're probably working toward unconventional success.$$,
  $$You're genuinely good at innovation and change. You lead change in organizations. You're not bound by conventional career paths. You inspire others to break rules.$$,
  $$You can be unstable professionally. You might quit impulsively. Your reputation might be erratic. You might alienate superiors through your rebelliousness.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  11,
  $$Community and friendship are important but changing. You're drawn to unconventional groups or causes. Your friend groups probably shift regularly. You value freedom and individuality in community.$$,
  $$Your friend groups are probably unusual or changing. You're drawn to alternative communities. You probably belong to progressive causes. You value uniqueness in friends.$$,
  $$You're genuinely good at building diverse communities. You bring people together across differences. You inspire collective change. You're not bound by cliquishness.$$,
  $$You can be emotionally detached in friendships. You might leave groups suddenly. You can struggle with consistency. You might prioritize causes over people.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Uranus',
  12,
  $$Your spirituality is unconventional or evolving. Solitude brings insight and innovation. Your inner world is unusual and hidden. Spiritual awakening might happen suddenly.$$,
  $$You probably have unusual spiritual experiences. Solitude brings important realizations. Your inner world is complex and unique. You might experience sudden spiritual shifts.$$,
  $$You're genuinely capable of spiritual innovation. You're not bound by traditional paths. Your insights are unique and valuable. You inspire others through authenticity.$$,
  $$You can be disconnected or scattered spiritually. You might use spirituality to escape. You can have instability in your inner work. You might suddenly reject spiritual practices.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- NEPTUNE IN HOUSES (Dreams, illusion, spirituality, dissolving boundaries, compassion)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  1,
  $$Your identity is fluid or unclear. People have difficulty understanding you or you're hard to pin down. You're artistic or dreamy. You're probably not grounded in mundane reality.$$,
  $$You're probably spiritual or imaginative. People might not understand you clearly. You're drawn to beauty and aesthetics. You might be spacey or hard to contact.$$,
  $$You're genuinely compassionate and intuitive. You're not bound by rigid identity. You can access imagination and creativity. You inspire others through your gentleness.$$,
  $$You can be vague or hard to understand. You might not have a clear sense of self. You can be evasive. You might lose yourself in others' images of you.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  2,
  $$Your relationship with money is confusing. You're not naturally good with finances or you don't pay attention. You might experience deception around money. You're probably not materialistic.$$,
  $$You're probably bad with money management. You're not motivated by accumulation. You might be naive about financial matters. Money matters confuse or bore you.$$,
  $$You're genuinely not enslaved to materialism. You can give generously. You're not focused on accumulation. You're willing to live simply.$$,
  $$You can be naive about financial responsibility. You might overspend on beautiful or escapist things. You can be deceived in financial dealings. You might not save.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  3,
  $$Your communication is poetic or unclear. You're drawn to metaphor and symbolism. You might be spiritual in your thinking. You struggle to be direct or clear in speech.$$,
  $$You probably speak poetically or symbolically. You're intuitive about what's unsaid. You're probably interested in spirituality. You might ramble or be unclear.$$,
  $$You're genuinely intuitive about others' unspoken feelings. You communicate with depth and poetry. You see symbolic meaning. You inspire imagination through words.$$,
  $$You can be unclear or confusing in communication. You might not say what you mean. You can spread confusion. You might lie without intent to.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  4,
  $$Home and family are idealized or confusing. You might not feel grounded in your family of origin. Family dynamics are complicated or unclear. Your sense of home is more emotional than physical.$$,
  $$Your family relationships are probably complicated. You might idealize family. Home base feels shaky. You probably escape through imagination.$$,
  $$You're genuinely compassionate toward family dysfunction. You can forgive and see spiritual meaning in trauma. You're not harsh about family failings. You create emotional home.$$,
  $$You can be unrealistic about family problems. You might enable dysfunction. Your home can feel unstable. You might not face family issues directly.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  5,
  $$Your love and creativity are romantic and idealized. You probably fall in love with potential or fantasy. Your creative expression is artistic. Reality doesn't quite measure up.$$,
  $$You probably idealize partners or fall into fantasy love. You're drawn to creative expression. Reality often disappoints your romantic ideals. You probably have rich inner fantasy life.$$,
  $$You're genuinely creative and artistic. You inspire through beauty and imagination. You're not cynical about love. You bring magic to ordinary moments.$$,
  $$You can be unrealistic about romance. You might stay in fantasy relationships instead of real ones. You can enable poor behavior. You might be disappointed constantly.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  6,
  $$Your work and health are idealized or confusing. You might have difficulty with routine or practical work. You're drawn to helping fields. Your body might absorb others' illnesses.$$,
  $$Your work is probably spiritually motivated. Routine work feels soul-killing. You're probably bad with practical details. Your health might be complicated or unclear.$$,
  $$You're genuinely compassionate in helping work. You can access others' pain without defensiveness. You're intuitive about what people need. You're not harsh about human failings.$$,
  $$You can be impractical or spacey at work. You might absorb others' stress physically. You can be unclear about health issues. You might avoid practical responsibilities.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  7,
  $$Partnership is idealized or confusing. You fall in love with potential. You might not see your partner clearly. You dissolve boundaries in intimacy. You're compassionate but possibly enabling.$$,
  $$You probably idealize partners. You see potential they don't have. You're probably very devoted. You might not see problems clearly.$$,
  $$You're genuinely devoted and spiritual in partnership. You love unconditionally. You see the best in people. You're not cynical about love.$$,
  $$You can be codependent or enabling. You might stay in poor relationships out of idealization. You can be naive about partners' true nature. You struggle with boundaries.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  8,
  $$Intimacy and shared resources are confusing. You might be deceived in finances or intimate situations. Deep bonding is mystical but potentially lost. You're spiritually sensitive to others' pain.$$,
  $$Your intimate relationships are probably idealized. You might be naive about partners' intentions. Shared finances are probably complicated. You absorb others' emotional pain.$$,
  $$You're genuinely capable of spiritual intimacy. You're compassionate about others' trauma. You can forgive betrayal. You access profound connection.$$,
  $$You can be naive or easily deceived. You might enable unhealthy dynamics. Shared resources create confusion. You might lose yourself in intimacy.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  9,
  $$Your beliefs are idealistic or confused. You're drawn to spirituality, maybe uncritically. Your worldview might be escapist. You see beauty and meaning in spirituality.$$,
  $$You're probably spiritual or drawn to it. Your beliefs are idealized. You might not question spiritual ideas carefully. Travel feels romantic and transformative.$$,
  $$You're genuinely spiritual and intuitive. You access wisdom beyond the ordinary. You're not dogmatic. You inspire others through spiritual compassion.$$,
  $$You can be naive spiritually or drawn to deceptive teachers. You might escape into spirituality. Your beliefs might be unrealistic. You can follow charismatic teachers blindly.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  10,
  $$Your career and reputation are idealized or confusing. You might be confused about your direction. Your reputation might be unclear or subject to others' projections. You're drawn to creative or healing work.$$,
  $$Your career path is probably unclear. You might idealize certain professions. Your reputation might be fuzzy. You're drawn to meaningful or creative work.$$,
  $$You're genuinely talented in creative or healing fields. You bring compassion to your work. You're not driven by pure ambition. You inspire through authenticity.$$,
  $$You can be confused about your professional direction. You might not be taken seriously or respected. You can sacrifice too much for idealized work. You might be naive professionally.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  11,
  $$Community and friendship are idealized. You're drawn to causes but might be naive. Group dynamics confuse you. You dissolve into group identity easily.$$,
  $$You're probably drawn to spiritual or idealistic groups. You might idealize communities. You easily dissolve into group energy. You're probably compassionate in group settings.$$,
  $$You're genuinely good at bringing people together compassionately. You're not cliquish. You can hold space for different perspectives. You inspire communities through vision.$$,
  $$You can be naive about group dynamics. You might follow charismatic leaders blindly. You can lose yourself in group identity. You might ignore real problems in communities.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Neptune',
  12,
  $$Your spirituality is profound and dissolving. You're drawn to meditation or mysticism. Your boundaries between self and other are thin. You might experience spiritual dissolution or transcendence.$$,
  $$You're probably naturally spiritual. Solitude feels spiritual. You probably meditate or have spiritual practices. You experience spiritual states easily.$$,
  $$You're genuinely spiritual and capable of real transcendence. You're not bound by ordinary consciousness. You inspire through spiritual presence. You're compassionate about human suffering.$$,
  $$You can be spacey or disconnected. You might escape into spiritual bypassing. You might lose touch with reality. You need grounding practices.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

-- PLUTO IN HOUSES (Power, death/rebirth, transformation, compulsion, intensity)

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  1,
  $$You have intensity and power. Your identity undergoes profound transformations. You're not surface—you're always becoming. People sense your depth and are careful around you.$$,
  $$You probably go through intense personal transformations. You're probably serious or intense. People either love or fear you. You're not light or casual.$$,
  $$You're genuinely powerful and authentic. You don't pretend to be okay when you're not. You inspire through your willingness to transform. You're not superficial.$$,
  $$You can be intense in overwhelming ways. You might be obsessive or compulsive. You can isolate through intensity. You might be controlling.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  2,
  $$Your relationship with resources is intense. You might experience dramatic financial transformations. Power and control around money matter. You build security compulsively.$$,
  $$Your money situation probably involves intensity. You might have experienced financial loss or gain dramatically. You're probably aware of power dynamics around resources. You build security seriously.$$,
  $$You're genuinely good at building real security. You're not naive about power and resources. You can recover from financial challenges. You understand strategic resource management.$$,
  $$You can be obsessive or controlling about money. You might experience compulsive spending or withholding. Financial loss can devastate you. You might be controlling with shared resources.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  3,
  $$Your thinking is penetrating and obsessive. You probe beneath surfaces. Your words have power. You notice what people don't say and why.$$,
  $$You're probably good at analysis and research. You're drawn to hidden motives and meanings. You're probably intense in conversation. You might research obsessively.$$,
  $$You're genuinely insightful and penetrating. You see what's hidden. People can't hide from your perception. You're excellent at research and investigation.$$,
  $$You can be obsessive in your thinking. You might not let things go. You can read hidden meaning where there is none. You might be paranoid.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  4,
  $$Home and family are intense. You probably have unresolved family trauma. Family dynamics involve power and control. You're building security against deep fears.$$,
  $$Your family relationships are probably intense. You might have experienced family trauma. You're probably aware of family power dynamics. You work to create a safe home.$$,
  $$You're genuinely loyal and protective of family. You're not afraid of family dysfunction. You work to heal family trauma. You create real safety.$$,
  $$You can be controlled by family patterns. You might recreate unhealthy dynamics. You can be controlling with family. Your home can feel like a fortress.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  5,
  $$Your love and creativity are intense and transformative. You love with obsessive passion. Your creative expression is powerful. Romance is death and rebirth.$$,
  $$Your love life is probably intense. You love deeply or not at all. Your creativity comes from deep compulsion. You pursue passion intensely.$$,
  $$You're genuinely powerful in creativity and passion. You create from your depths. Your love is transformative. You don't settle for superficial connection.$$,
  $$You can be obsessive or jealous in love. You might be possessive of partners. You can be controlling romantically. You might use power destructively.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  6,
  $$Your work and health are compulsive or transformative. You're driven to master and perfect. You might experience health crises that transform you. You're intense about improvement.$$,
  $$You're probably driven and intense at work. You work with real intensity. Your health might go through transformations. You're committed to improvement.$$,
  $$You're genuinely powerful at work and mastery. You transform processes and systems. You work with real power. You're not afraid of deep change.$$,
  $$You can be workaholic or obsessive. You might have health issues from stress. You can be controlling at work. You might burnout from intensity.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  7,
  $$Partnership is intense and transformative. You need deep soul connection. Power and control are issues. You're not interested in light partnership.$$,
  $$Your relationships are probably intense. You're drawn to deep connection. Power dynamics matter. You're not satisfied with superficial partnership.$$,
  $$You're genuinely capable of real depth. You transform through partnership. You're not afraid of intensity. You're loyal in profound ways.$$,
  $$You can be controlling or possessive. You might create power struggles. You can be manipulative. You might sabotage relationships.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  8,
  $$Intimacy and transformation are your terrain. You go to the depths. Sexuality is profound and important. Shared resources are power plays. You're reborn through crisis.$$,
  $$Your intimate relationships are probably intense. You're drawn to depth and power. Shared finances might involve struggle. You transform through crisis.$$,
  $$You're genuinely capable of real depth and transformation. You're not afraid of the dark. You inspire transformation in others. You're truly powerful.$$,
  $$You can be controlling or manipulative. You might struggle with jealousy or obsession. Shared resources can become battlegrounds. You might use power destructively.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  9,
  $$Your beliefs are intense and possibly obsessive. You transform through seeking truth. Your worldview involves dark and light. You're not interested in surface spirituality.$$,
  $$Your beliefs are probably deeply held. You pursue truth intensely. You're drawn to deep philosophy or spirituality. You question everything.$$,
  $$You're genuinely deep in your seeking. You're not satisfied with easy answers. You transform through understanding. You inspire through authentic questioning.$$,
  $$You can be dogmatic or obsessive about beliefs. You might be preachy. You can judge others' beliefs harshly. You might get lost in darkness.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  10,
  $$Your career and power are intense. You're driven to achieve and control. You might experience dramatic professional transformations. Your reputation has depth and power.$$,
  $$You're probably ambitious and intense professionally. You're aware of power dynamics. You pursue significant achievement. You might experience dramatic career changes.$$,
  $$You're genuinely powerful professionally. You inspire through authentic power. You're not afraid of responsibility. You transform through leadership.$$,
  $$You can be controlling or manipulative professionally. You might struggle with authority. You can create power struggles. You might be ruthless.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  11,
  $$Community and groups are intense. You're drawn to powerful groups or causes. Power dynamics in groups matter. You help transform collective consciousness.$$,
  $$You're probably intense in groups. You're drawn to powerful movements or causes. You're aware of group power dynamics. You take collective action seriously.$$,
  $$You're genuinely good at group transformation. You inspire collective change. You're not a follower—you lead. You see power structures clearly.$$,
  $$You can be controlling in groups. You might struggle with authority or being told what to do. You can be obsessive about causes. You might dominate groups.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);

INSERT INTO kb_planet_in_house (planet, house_number, summary, life_patterns, strengths, challenges, book_references)
VALUES (
  'Pluto',
  12,
  $$Your spirituality involves confronting the depths. You're drawn to shadow work. Transformation happens in solitude. You access deep power internally.$$,
  $$You're probably drawn to deep spiritual work. You face your shadow. Solitude brings transformation. You're probably interested in psychology or healing.$$,
  $$You're genuinely capable of real spiritual transformation. You're not afraid of your shadow. You inspire through authentic inner work. You transform through crisis.$$,
  $$You can be obsessive or isolated spiritually. You might get lost in your inner work. You can struggle with isolation. You might use spirituality to hide.$$,
  ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']
);
