import { supabase } from "./supabase";

// ============================================================
// Types
// ============================================================
export interface AIConversation {
  id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  sender: "patient" | "ai";
  message: string;
  created_at: string;
}

interface ChatResponse {
  conversationId: string;
  response: string;
}

// ============================================================
// Smart Fallback Response Generator
// ============================================================
function generateFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  // ── Blood-related queries ──
  if (
    lower.includes("need blood") ||
    lower.includes("blood required") ||
    lower.includes("blood urgently") ||
    lower.includes("require blood") ||
    lower.includes("b+") ||
    lower.includes("b-") ||
    lower.includes("o+") ||
    lower.includes("o-") ||
    lower.includes("a+") ||
    lower.includes("a-") ||
    lower.includes("ab+") ||
    lower.includes("ab-") ||
    lower.includes("blood group") ||
    lower.includes("blood donation") ||
    lower.includes("donate blood") ||
    lower.includes("blood donor")
  ) {
    return `**I understand you need help with blood services.** Here's what I recommend:\n\n- 🩸 **Search for donors** — Use the [Request Blood](/patient/request) page to submit a blood requirement to nearby donors and blood banks.\n- 📋 **Track your requests** — Visit [My Requests](/patient/requests) to monitor the status of your blood requests.\n- 🏥 **Find blood banks** — Check [Nearby Help](/patient/nearby) for blood banks in your area.\n\n**Important tips:**\n- Always verify the donor's blood group compatibility\n- Ensure cross-matching is done at the hospital before transfusion\n- For emergency needs, contact the nearest hospital blood bank directly\n\n> 💡 *Tip: The more details you provide in your request (blood group, units needed, urgency level), the faster you'll find a match.*`;
  }

  // ── Emergency / Urgent ──
  if (
    lower.includes("emergency") ||
    lower.includes("accident") ||
    lower.includes("critical") ||
    lower.includes("dying") ||
    lower.includes("unconscious") ||
    lower.includes("heart attack") ||
    lower.includes("stroke") ||
    lower.includes("seizure") ||
    lower.includes("not breathing") ||
    lower.includes("severe bleeding")
  ) {
    return `🚨 **This sounds like a medical emergency!**\n\n**Immediate steps:**\n1. **Call emergency services** — Dial **112** (India) or your local emergency number immediately\n2. **Go to the nearest hospital** — Visit [Nearby Help](/patient/nearby) to find hospitals near you\n3. **Stay calm** — Keep the patient comfortable and still until help arrives\n\n**Do NOT:**\n- ❌ Delay calling for professional help\n- ❌ Try to self-treat serious injuries\n- ❌ Move the patient if you suspect a spinal injury\n\n**If blood is needed urgently**, submit an emergency request on the [Request Blood](/patient/request) page with **High urgency** selected.\n\n⚠️ *This AI cannot replace emergency medical services. Please seek immediate professional help.*`;
  }

  // ── ICU / Hospital / Beds ──
  if (
    lower.includes("icu") ||
    lower.includes("intensive care") ||
    lower.includes("ventilator") ||
    lower.includes("hospital bed") ||
    lower.includes("oxygen") ||
    lower.includes("admission")
  ) {
    return `🏥 **Hospital & ICU Information**\n\nI can help you find hospital resources:\n\n- **Check availability** — Visit [Nearby Help](/patient/nearby) to see real-time ICU bed and ventilator availability\n- **Hospital directory** — Browse hospitals by type (Government, Private, Blood Bank)\n- **Emergency services** — Filter hospitals with emergency departments\n\n**What to know about ICU admission:**\n- ICU beds are typically allocated based on medical priority\n- Carry all medical records and ID proof\n- A doctor's referral may speed up the process\n- Government hospitals often have more ICU availability\n\n> 💡 *Tip: Call the hospital before visiting to confirm bed availability and required documentation.*`;
  }

  // ── Medicine / Prescription ──
  if (
    lower.includes("medicine") ||
    lower.includes("tablet") ||
    lower.includes("prescription") ||
    lower.includes("drug") ||
    lower.includes("dosage") ||
    lower.includes("antibiotic") ||
    lower.includes("painkiller")
  ) {
    return `💊 **About Medications**\n\nI'm not qualified to prescribe or recommend specific medicines. Here's what I suggest:\n\n- **Consult your doctor** — Only a qualified physician can prescribe medications after proper examination\n- **Don't self-medicate** — Taking medicines without prescription can be harmful\n- **Follow prescriptions** — Always complete the full course as prescribed\n\n**General safety tips:**\n- ✅ Store medicines in a cool, dry place\n- ✅ Check expiry dates before use\n- ✅ Inform your doctor about any allergies\n- ✅ Never share prescription medications\n- ❌ Don't stop medications abruptly without consulting your doctor\n\n> ⚕️ *For medication queries, please visit your healthcare provider or consult a pharmacist.*`;
  }

  // ── Weakness / Fatigue ──
  if (
    lower.includes("weak") ||
    lower.includes("tired") ||
    lower.includes("fatigue") ||
    lower.includes("exhausted") ||
    lower.includes("no energy") ||
    lower.includes("dizzy") ||
    lower.includes("dizziness")
  ) {
    return `**Feeling weak or fatigued?** Here are some general health tips:\n\n**Common causes of weakness:**\n- 🥤 Dehydration — Not drinking enough water\n- 🍽️ Poor nutrition — Skipping meals or unbalanced diet\n- 😴 Lack of sleep — Irregular sleep patterns\n- 🩸 Low hemoglobin — Iron deficiency or anemia\n- 💊 Vitamin deficiency — Especially B12 and Vitamin D\n\n**Recommended steps:**\n1. **Stay hydrated** — Drink at least 8-10 glasses of water daily\n2. **Eat balanced meals** — Include iron-rich foods like spinach, lentils, and dates\n3. **Rest well** — Aim for 7-8 hours of sleep\n4. **Get a blood test** — Check your hemoglobin and vitamin levels\n5. **Light exercise** — A short walk can help boost energy\n\n**When to see a doctor:**\n- If weakness persists for more than a week\n- If accompanied by chest pain, breathlessness, or fainting\n- If you notice unusual bruising or bleeding\n\n> 🩺 *If your weakness is severe or sudden, please consult a doctor promptly.*`;
  }

  // ── Fever ──
  if (
    lower.includes("fever") ||
    lower.includes("temperature") ||
    lower.includes("hot") ||
    lower.includes("chills") ||
    lower.includes("shivering")
  ) {
    return `🌡️ **Managing Fever**\n\nFever is your body's natural response to infection. Here's some general guidance:\n\n**Immediate care:**\n- 💧 **Stay hydrated** — Drink plenty of water, ORS, soups, and fresh juices\n- 🛏️ **Rest** — Allow your body to recover\n- 🧊 **Cool compress** — Apply a damp cloth on your forehead\n- 👕 **Light clothing** — Wear loose, comfortable clothes\n\n**Temperature guide:**\n| Temperature | Severity |\n|---|---|\n| 98.6°F (37°C) | Normal |\n| 99-100.4°F | Low-grade fever |\n| 100.4-103°F | Moderate fever |\n| Above 103°F | **High fever — See a doctor** |\n\n**See a doctor immediately if:**\n- ⚠️ Fever lasts more than 3 days\n- ⚠️ Temperature exceeds 103°F (39.4°C)\n- ⚠️ Accompanied by severe headache, stiff neck, or rash\n- ⚠️ Difficulty breathing or chest pain\n\n> 🩺 *Do not self-prescribe antibiotics. Consult a doctor for proper diagnosis and treatment.*`;
  }

  // ── Headache ──
  if (
    lower.includes("headache") ||
    lower.includes("head pain") ||
    lower.includes("migraine") ||
    lower.includes("head hurts")
  ) {
    return `🤕 **Dealing with Headaches**\n\n**Common types:**\n- **Tension headache** — Dull, aching pain around the forehead\n- **Migraine** — Throbbing pain, often on one side, with sensitivity to light/sound\n- **Sinus headache** — Pain around forehead, cheeks, and nose\n\n**Quick relief tips:**\n1. 💧 **Hydrate** — Dehydration is a top cause of headaches\n2. 🌙 **Rest** in a quiet, dark room\n3. 🧊 **Cold or warm compress** on forehead or neck\n4. 💆 **Gentle massage** — Press temples in circular motion\n5. 🫁 **Deep breathing** — Slow, deep breaths to relieve tension\n6. ☕ **Limit caffeine** — Both excess and withdrawal can trigger headaches\n\n**See a doctor if:**\n- Headache is the worst you've ever had\n- It comes on suddenly and severely\n- Accompanied by fever, stiff neck, confusion, or vision changes\n- Headaches are becoming more frequent\n\n> 🩺 *Chronic headaches deserve medical attention. Keep a headache diary to help your doctor identify patterns.*`;
  }

  // ── Cold / Cough / Flu ──
  if (
    lower.includes("cold") ||
    lower.includes("cough") ||
    lower.includes("flu") ||
    lower.includes("sneez") ||
    lower.includes("runny nose") ||
    lower.includes("sore throat") ||
    lower.includes("throat pain")
  ) {
    return `🤧 **Managing Cold, Cough & Flu**\n\n**Home care tips:**\n- 🍵 **Warm fluids** — Drink warm water, herbal tea, or soup to soothe your throat\n- 🍯 **Honey & ginger** — Natural remedy for throat irritation and cough\n- 🧂 **Salt water gargle** — Gargle 2-3 times daily for sore throat\n- 💨 **Steam inhalation** — Helps clear nasal congestion\n- 😴 **Rest** — Your body needs energy to fight the infection\n- 🍊 **Vitamin C** — Eat citrus fruits, amla, or guava\n\n**Prevention:**\n- ✅ Wash hands frequently\n- ✅ Avoid close contact with sick people\n- ✅ Cover mouth when coughing/sneezing\n- ✅ Stay warm in cold weather\n\n**See a doctor if:**\n- Symptoms persist beyond 10 days\n- You have high fever (>103°F)\n- Difficulty breathing or wheezing\n- Severe body aches or sinus pain\n\n> 🩺 *Most colds resolve on their own in 7-10 days. Seek medical advice if symptoms worsen.*`;
  }

  // ── Stomach / Digestive ──
  if (
    lower.includes("stomach") ||
    lower.includes("vomit") ||
    lower.includes("nausea") ||
    lower.includes("diarrhea") ||
    lower.includes("acidity") ||
    lower.includes("gas") ||
    lower.includes("indigestion") ||
    lower.includes("constipation") ||
    lower.includes("abdominal pain")
  ) {
    return `🤢 **Digestive Health Guidance**\n\n**For nausea/vomiting:**\n- Sip small amounts of clear fluids (water, ORS)\n- Eat light — crackers, toast, or plain rice\n- Avoid spicy, oily, or heavy foods\n- Ginger tea can help settle the stomach\n\n**For acidity/gas:**\n- Eat smaller, more frequent meals\n- Avoid lying down immediately after eating\n- Reduce spicy, fried, and citrus foods\n- Drink lukewarm water after meals\n\n**For constipation:**\n- Increase fiber intake (fruits, vegetables, whole grains)\n- Drink at least 8-10 glasses of water daily\n- Regular physical activity helps digestion\n\n**When to see a doctor:**\n- ⚠️ Blood in vomit or stool\n- ⚠️ Severe abdominal pain\n- ⚠️ Persistent vomiting for more than 24 hours\n- ⚠️ Signs of dehydration (dark urine, dry mouth)\n\n> 🩺 *Persistent digestive issues should be evaluated by a gastroenterologist.*`;
  }

  // ── Hospital / Doctor ──
  if (
    lower.includes("hospital") ||
    lower.includes("doctor") ||
    lower.includes("clinic") ||
    lower.includes("nearby") ||
    lower.includes("find doctor")
  ) {
    return `🏥 **Finding Healthcare Near You**\n\nI can help you locate healthcare facilities:\n\n- 📍 **Nearby hospitals** — Visit [Nearby Help](/patient/nearby) to find hospitals, blood banks, and clinics near your location\n- 🔍 **Filter by services** — Search for hospitals with specific services like blood banks, emergency departments, or ICU facilities\n- 📞 **Contact directly** — Call the hospital before visiting to check availability\n\n**Tips for hospital visits:**\n- 📄 Carry all medical records and prescriptions\n- 🪪 Bring valid ID proof and insurance documents\n- 📝 List your current medications and allergies\n- 👥 Have a family member accompany you if possible\n\n> 💡 *For non-emergency consultations, consider booking an appointment to avoid long wait times.*`;
  }

  // ── Greeting ──
  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("hey") ||
    lower.includes("good morning") ||
    lower.includes("good evening") ||
    lower.includes("namaste")
  ) {
    return `👋 **Hello! Welcome to Niramaya AI Health Assistant.**\n\nI'm here to help you with:\n\n- 🩺 **Health guidance** — Ask about symptoms or general health queries\n- 🩸 **Blood services** — Find donors, request blood, or get donation info\n- 🏥 **Hospital info** — Locate nearby hospitals and check resource availability\n- ❓ **Health tips** — General wellness and preventive care advice\n\n**How can I assist you today?** Feel free to describe your symptoms or ask any health-related question!\n\n> 💡 *Remember: I provide general guidance only. For medical emergencies, please call 112 or visit the nearest hospital.*`;
  }

  // ── Thank you ──
  if (
    lower.includes("thank") ||
    lower.includes("thanks") ||
    lower.includes("helpful") ||
    lower.includes("appreciate")
  ) {
    return `😊 **You're welcome!** I'm glad I could help.\n\nRemember, I'm always here if you need:\n- Health guidance or symptom information\n- Blood service assistance\n- Hospital and healthcare facility information\n\n**Stay healthy and take care!** 💚\n\n> 🩺 *Don't hesitate to consult a doctor for any persistent health concerns.*`;
  }

  // ── Default fallback ──
  return `Thank you for your question. Here's some general health guidance:\n\n**General Wellness Tips:**\n- 💧 **Stay hydrated** — Drink 8-10 glasses of water daily\n- 🥗 **Balanced diet** — Include proteins, vitamins, and minerals in every meal\n- 🏃 **Regular exercise** — At least 30 minutes of physical activity daily\n- 😴 **Quality sleep** — Aim for 7-8 hours every night\n- 🧘 **Manage stress** — Practice meditation or deep breathing exercises\n\n**Your health profile is personalized on Niramaya.** Here's what you can do:\n- 🩸 [Request Blood](/patient/request) — If you need blood services\n- 🏥 [Nearby Help](/patient/nearby) — Find hospitals and blood banks\n- 📋 [My Requests](/patient/requests) — Track your blood requests\n\nCould you provide more details about your concern? I can give better guidance if you describe:\n- What symptoms you're experiencing\n- How long you've had them\n- Any other relevant health information\n\n> 🩺 *For specific medical conditions, please consult a qualified healthcare professional.*`;
}

// ============================================================
// API Functions
// ============================================================

/**
 * Send a message to the AI assistant via the Edge Function.
 * Falls back to intelligent demo responses if the API fails.
 */
export async function sendMessage(
  conversationId: string | null,
  message: string
): Promise<ChatResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in to use the AI assistant.");
  }

  try {
    // Try the real Gemini-powered Edge Function first
    const { data, error } = await supabase.functions.invoke("ai-chat", {
      body: { conversationId, message },
    });

    if (error) {
      throw error;
    }

    if (data?.response && data?.conversationId) {
      return data as ChatResponse;
    }

    throw new Error("Invalid response format");
  } catch (err) {
    console.warn("AI API unavailable, using smart fallback:", err);

    // ── Fallback: save to DB locally and generate response ──
    let fallbackConvId = conversationId;

    // Create conversation if needed
    if (!fallbackConvId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: newConv } = await supabase
          .from("ai_conversations")
          .insert({ patient_id: user.id })
          .select("id")
          .single();
        if (newConv) {
          fallbackConvId = newConv.id;
        }
      }
    }

    // Save user message
    if (fallbackConvId) {
      await supabase.from("ai_messages").insert({
        conversation_id: fallbackConvId,
        sender: "patient",
        message,
      });
    }

    // Generate smart fallback
    const fallbackResponse = generateFallbackResponse(message);

    // Append disclaimer
    const fullResponse =
      fallbackResponse +
      "\n\n---\n*⚕️ Disclaimer: This AI provides general health guidance only. Always consult a qualified medical professional for diagnosis and treatment.*";

    // Save AI response
    if (fallbackConvId) {
      await supabase.from("ai_messages").insert({
        conversation_id: fallbackConvId,
        sender: "ai",
        message: fullResponse,
      });
    }

    return {
      conversationId: fallbackConvId || "demo-" + Date.now(),
      response: fullResponse,
    };
  }
}

/**
 * Fetch all conversations for the current user, ordered by most recent.
 */
export async function fetchConversations(): Promise<AIConversation[]> {
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all messages for a specific conversation.
 */
export async function fetchMessages(
  conversationId: string
): Promise<AIMessage[]> {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new empty conversation and return it.
 */
export async function createConversation(): Promise<AIConversation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ patient_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a conversation (cascades to messages).
 */
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) throw error;
}
