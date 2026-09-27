"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Locale = "fa" | "en";

/* Persian wording follows the UX-writing vocabulary reference:
   پیش‌خوان = dashboard, حساب کاربری = profile, دیدگاه = comment,
   اعلان‌ها = notifications, رایانامه = email, همراه‌سازی = onboarding. */
const dict = {
  fa: {
    brand: "همراه‌سلامت من",
    brandSub: "جامعه بیماران ایران",
    nav_home: "خانه",
    nav_dashboard: "پیش‌خوان",
    nav_track: "پایش سلامت",
    nav_community: "جامعه",
    nav_insights: "بینش تجمیعی",
    nav_profile: "حساب کاربری",
    login: "ورود",
    signup: "ثبت‌نام",
    logout: "خروج",
    getStarted: "شروع کنید",
    theme_light: "روشن",
    theme_dark: "تاریک",

    hero_badge: "داده سلامت، با رضایت شما",
    hero_title_1: "بیمارانی مثل شما،",
    hero_title_2: "تجربه‌ای که راه را روشن می‌کند",
    hero_body:
      "علائم، درمان‌ها و کیفیت زندگی‌تان را ثبت کنید، روند خود را ببینید و تجربه هزاران بیمار مشابه را بخوانید. داده شما تنها به‌صورت تجمیعی و ناشناس برای پژوهش استفاده می‌شود.",
    hero_cta: "رایگان عضو شوید",
    hero_cta2: "دیدن جامعه‌ها",
    trust_1: "بدون فروش داده فردی",
    trust_2: "ناشناس‌سازی پیش‌فرض",
    trust_3: "رضایت آگاهانه و قابل لغو",

    stat_members: "عضو",
    stat_conditions: "جامعه بیماری",
    stat_posts: "تجربه ثبت‌شده",
    stat_datapoints: "نقطه داده سلامت",

    f_title: "سه ابزار، یک مسیر",
    f_sub: "از ثبت روزانه تا بینش تجمیعی قابل پژوهش",
    f1_t: "جامعه بیماری‌محور",
    f1_b: "گروه‌های امن با نظارت آموزش‌دیده؛ تجربه واقعی به‌جای توصیه قطعی درمانی.",
    f2_t: "پایش شخصی و گزارش پزشک",
    f2_b: "ثبت علائم، دارو، آزمایش و کیفیت زندگی با نمودار روند و خروجی قابل ارائه به پزشک.",
    f3_t: "بینش تجمیعی و ناشناس",
    f3_b: "الگوی علائم و اثربخشی درمان در جمعیت بیماران، با حداقل آستانه نمونه.",

    how_title: "چطور کار می‌کند",
    how_1t: "همراه‌سازی",
    how_1b: "جامعه بیماری خود را انتخاب کنید و حساب کاربری بسازید.",
    how_2t: "ثبت روزانه",
    how_2b: "در کمتر از یک دقیقه، شدت علائم و کیفیت زندگی را ثبت کنید.",
    how_3t: "دیدن روند",
    how_3b: "نمودار هفتگی و ماهانه، الگوهایی را نشان می‌دهد که در حافظه گم می‌شوند.",
    how_4t: "مقایسه با همتایان",
    how_4b: "ببینید بیماران مشابه چه تجربه‌ای از همان درمان داشته‌اند.",

    ethics_t: "حاکمیت داده، از روز اول",
    ethics_b:
      "هیچ پرونده فردی فروخته نمی‌شود. هر گزارش سازمانی نیازمند رضایت آگاهانه، حداقل حجم نمونه و قرارداد منع شناسایی مجدد است. شما هر زمان می‌توانید رضایت خود را پس بگیرید.",

    cta_t: "تنها نیستید",
    cta_b: "همین امروز اولین ثبت خود را انجام دهید.",

    footer_note: "این پلتفرم جایگزین پزشک نیست. در شرایط اضطراری با اورژانس تماس بگیرید.",

    /* auth */
    auth_login_t: "به حساب کاربری خود وارد شوید",
    auth_signup_t: "به جامعه بپیوندید",
    email: "رایانامه",
    password: "رمز عبور",
    name: "نام نمایشی",
    role: "نقش شما",
    role_patient: "بیمار",
    role_caregiver: "مراقب / همراه",
    role_clinician: "پزشک",
    role_researcher: "پژوهشگر",
    pick_condition: "جامعه بیماری (اختیاری)",
    have_account: "حساب کاربری دارید؟",
    no_account: "هنوز عضو نشده‌اید؟",
    demo_hint: "برای مشاهده سریع، با حساب نمونه وارد شوید",
    demo_fill: "پرکردن حساب نمونه",
    continue: "تایید",

    /* dashboard */
    dash_hi: "سلام",
    dash_sub: "روند شما در ۶۰ روز گذشته",
    kpi_symptom: "میانگین شدت علائم",
    kpi_quality: "کیفیت زندگی",
    kpi_adherence: "پایبندی دارویی",
    kpi_streak: "روز پیاپی ثبت",
    kpi_week: "۷ روز اخیر",
    trend_t: "روند علائم و کیفیت زندگی",
    trend_sub: "میانگین روزانه، مقیاس ۰ تا ۱۰",
    top_symptoms: "پرتکرارترین علائم شما",
    labs_t: "آزمایش‌ها",
    no_data: "هنوز داده‌ای ثبت نشده است",
    add_first: "اولین ثبت را انجام دهید",
    my_communities: "جامعه‌های من",
    active_treatments: "درمان‌های فعال",
    export_pdf: "گزارش برای پزشک",

    /* track */
    track_t: "پایش سلامت",
    track_sub: "ثبت روزانه، کمتر از یک دقیقه",
    tab_symptom: "علائم",
    tab_quality: "کیفیت زندگی",
    tab_lab: "آزمایش",
    tab_treatment: "درمان‌ها",
    label: "عنوان",
    severity: "شدت",
    value: "مقدار",
    unit: "واحد",
    note: "یادداشت",
    save: "ثبت",
    saved: "ثبت شد",
    recent: "ثبت‌های اخیر",
    delete: "حذف",
    t_name: "نام دارو یا درمان",
    t_dose: "دوز",
    t_purpose: "هدف درمان",
    t_effect: "اثربخشی",
    t_side: "عوارض",
    t_add: "افزودن درمان",
    t_active: "فعال",
    t_stopped: "متوقف‌شده",

    /* community */
    comm_t: "جامعه‌های بیماری",
    comm_sub: "جایی که تجربه‌ها به هم وصل می‌شوند",
    members: "عضو",
    join: "پیوستن",
    joined: "عضو هستید",
    feed: "تجربه‌های تازه",
    new_post: "نوشتن تجربه",
    post_title: "عنوان",
    post_body: "متن تجربه",
    kind_experience: "تجربه",
    kind_question: "پرسش",
    kind_tip: "نکته",
    comments: "دیدگاه‌ها",
    add_comment: "دیدگاه خود را بنویسید",
    send: "ارسال",
    likes: "مفید بود",
    back: "بازگشت",
    all: "همه",

    /* insights */
    ins_t: "بینش تجمیعی",
    ins_sub: "الگوهای ناشناس‌سازی‌شده در جمعیت بیماران",
    cohort: "حجم جمعیت",
    min_cohort: "حداقل آستانه نمونه",
    ins_symptoms: "شیوع و شدت علائم",
    ins_treatments: "اثربخشی درمان‌ها",
    ins_trend: "روند ماهانه",
    ins_demo: "ترکیب سنی",
    people: "نفر",
    effectiveness: "اثربخشی (۱ تا ۵)",
    side_rate: "درصد گزارش عارضه",
    still: "همچنان مصرف می‌کنند",
    suppressed: "برای حفظ حریم خصوصی، گزارش این گروه کوچک نمایش داده نمی‌شود.",

    /* profile */
    prof_t: "حساب کاربری",
    city: "شهر",
    birth: "سال تولد",
    gender: "جنسیت",
    g_f: "زن",
    g_m: "مرد",
    g_o: "دیگر",
    bio: "درباره من",
    consent_t: "رضایت پژوهشی",
    consent_b: "داده ناشناس من برای گزارش‌های تجمیعی پژوهشی استفاده شود.",
    update: "ذخیره تغییرات",
    updated: "ذخیره شد",
    need_login: "برای دیدن این بخش وارد شوید",
  },
  en: {
    brand: "MyHealth Companion",
    brandSub: "Patient community of Iran",
    nav_home: "Home",
    nav_dashboard: "Dashboard",
    nav_track: "Tracking",
    nav_community: "Community",
    nav_insights: "Insights",
    nav_profile: "Profile",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    getStarted: "Get started",
    theme_light: "Light",
    theme_dark: "Dark",

    hero_badge: "Health data, with your consent",
    hero_title_1: "Patients like you,",
    hero_title_2: "experience that lights the way",
    hero_body:
      "Track symptoms, treatments and quality of life, see your own trend, and read what thousands of similar patients live through. Your data is only ever used aggregated and de-identified.",
    hero_cta: "Join for free",
    hero_cta2: "Browse communities",
    trust_1: "No individual data is sold",
    trust_2: "Anonymised by default",
    trust_3: "Consent you can withdraw",

    stat_members: "members",
    stat_conditions: "condition communities",
    stat_posts: "shared experiences",
    stat_datapoints: "health data points",

    f_title: "Three tools, one path",
    f_sub: "From a daily log to research-grade aggregate insight",
    f1_t: "Condition communities",
    f1_b: "Moderated, safe groups — lived experience instead of definitive medical advice.",
    f2_t: "Personal tracking & doctor report",
    f2_b: "Log symptoms, medication, labs and quality of life, with trend charts you can hand to your clinician.",
    f3_t: "Anonymised aggregate insight",
    f3_b: "Symptom patterns and treatment effectiveness across the cohort, with a minimum sample threshold.",

    how_title: "How it works",
    how_1t: "Onboarding",
    how_1b: "Pick your condition community and create an account.",
    how_2t: "Log daily",
    how_2b: "Record symptom severity and quality of life in under a minute.",
    how_3t: "See the trend",
    how_3b: "Weekly and monthly charts surface patterns memory loses.",
    how_4t: "Compare with peers",
    how_4b: "See how similar patients experienced the same treatment.",

    ethics_t: "Data governance from day one",
    ethics_b:
      "No individual record is ever sold. Every organisational report requires informed consent, a minimum sample size and a no-re-identification contract. You can withdraw consent at any time.",

    cta_t: "You are not alone",
    cta_b: "Make your first entry today.",

    footer_note: "This platform does not replace your doctor. In an emergency, call emergency services.",

    auth_login_t: "Log in to your profile",
    auth_signup_t: "Join the community",
    email: "Email",
    password: "Password",
    name: "Display name",
    role: "Your role",
    role_patient: "Patient",
    role_caregiver: "Caregiver",
    role_clinician: "Clinician",
    role_researcher: "Researcher",
    pick_condition: "Condition community (optional)",
    have_account: "Already have an account?",
    no_account: "Not a member yet?",
    demo_hint: "Want a quick look? Use the demo account",
    demo_fill: "Fill demo account",
    continue: "Continue",

    dash_hi: "Hello",
    dash_sub: "Your trend over the last 60 days",
    kpi_symptom: "Avg. symptom severity",
    kpi_quality: "Quality of life",
    kpi_adherence: "Medication adherence",
    kpi_streak: "Day logging streak",
    kpi_week: "last 7 days",
    trend_t: "Symptoms & quality of life",
    trend_sub: "Daily average, 0–10 scale",
    top_symptoms: "Your most reported symptoms",
    labs_t: "Lab results",
    no_data: "No data recorded yet",
    add_first: "Make your first entry",
    my_communities: "My communities",
    active_treatments: "Active treatments",
    export_pdf: "Report for my doctor",

    track_t: "Health tracking",
    track_sub: "Daily logging in under a minute",
    tab_symptom: "Symptoms",
    tab_quality: "Quality of life",
    tab_lab: "Labs",
    tab_treatment: "Treatments",
    label: "Label",
    severity: "Severity",
    value: "Value",
    unit: "Unit",
    note: "Note",
    save: "Save",
    saved: "Saved",
    recent: "Recent entries",
    delete: "Delete",
    t_name: "Medication or therapy",
    t_dose: "Dosage",
    t_purpose: "Purpose",
    t_effect: "Effectiveness",
    t_side: "Side effects",
    t_add: "Add treatment",
    t_active: "Active",
    t_stopped: "Stopped",

    comm_t: "Condition communities",
    comm_sub: "Where experiences connect",
    members: "members",
    join: "Join",
    joined: "Joined",
    feed: "Latest experiences",
    new_post: "Share an experience",
    post_title: "Title",
    post_body: "Your experience",
    kind_experience: "Experience",
    kind_question: "Question",
    kind_tip: "Tip",
    comments: "Comments",
    add_comment: "Write a comment",
    send: "Send",
    likes: "helpful",
    back: "Back",
    all: "All",

    ins_t: "Aggregate insights",
    ins_sub: "De-identified patterns across the patient population",
    cohort: "Cohort size",
    min_cohort: "Minimum sample threshold",
    ins_symptoms: "Symptom prevalence & severity",
    ins_treatments: "Treatment effectiveness",
    ins_trend: "Monthly trend",
    ins_demo: "Age distribution",
    people: "people",
    effectiveness: "Effectiveness (1–5)",
    side_rate: "Side-effect report rate",
    still: "still taking it",
    suppressed: "This cohort is too small to report — withheld to protect privacy.",

    prof_t: "Profile",
    city: "City",
    birth: "Year of birth",
    gender: "Gender",
    g_f: "Female",
    g_m: "Male",
    g_o: "Other",
    bio: "About me",
    consent_t: "Research consent",
    consent_b: "Use my anonymised data in aggregate research reports.",
    update: "Save changes",
    updated: "Saved",
    need_login: "Log in to see this section",
  },
} as const;

export type Key = keyof (typeof dict)["fa"];

const Ctx = createContext<{
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (k: Key) => string;
  setLocale: (l: Locale) => void;
  num: (n: number | string) => string;
}>({ locale: "fa", dir: "rtl", t: (k) => k, setLocale: () => {}, num: (n) => String(n) });

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fa");

  useEffect(() => {
    const saved = (localStorage.getItem("locale") as Locale) || "fa";
    setLocaleState(saved);
  }, []);

  useEffect(() => {
    const dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem("locale", l);
    setLocaleState(l);
  }, []);

  const t = useCallback((k: Key) => (dict[locale] as Record<string, string>)[k] ?? k, [locale]);
  const num = useCallback(
    (n: number | string) =>
      locale === "fa" ? String(n).replace(/\d/g, (d) => FA_DIGITS[+d]) : String(n),
    [locale]
  );

  return (
    <Ctx.Provider value={{ locale, dir: locale === "fa" ? "rtl" : "ltr", t, setLocale, num }}>
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);
