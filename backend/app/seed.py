"""Demo data so the product tells its story the moment it boots."""
import datetime as dt
import math
import random

from sqlmodel import Session, select

from .core import hash_password
from .db import engine
from .models import Comment, Condition, Entry, Like, Membership, Post, Treatment, User

CONDITIONS = [
    ("diabetes", "دیابت", "Diabetes", "قند خون، رژیم، انسولین و زندگی روزمره با دیابت نوع ۱ و ۲.",
     "Blood sugar, diet, insulin and daily life with type 1 and 2 diabetes.", "droplet", "#0ea5e9"),
    ("ms", "ام‌اس", "Multiple Sclerosis", "تجربه‌های حمله، خستگی، داروهای تعدیل‌کننده و توان‌بخشی.",
     "Relapses, fatigue, disease-modifying therapies and rehabilitation.", "brain", "#8b5cf6"),
    ("cancer", "سرطان", "Cancer", "شیمی‌درمانی، عوارض، تغذیه و حمایت روانی در مسیر درمان.",
     "Chemotherapy, side effects, nutrition and emotional support.", "ribbon", "#ec4899"),
    ("cardio", "بیماری‌های قلبی", "Cardiovascular", "فشار خون، نارسایی قلبی، ورزش و داروهای قلب.",
     "Blood pressure, heart failure, exercise and cardiac medication.", "heart", "#ef4444"),
    ("kidney", "بیماری کلیوی", "Kidney Disease", "دیالیز، رژیم کم‌پروتئین، پیوند و پایش کراتینین.",
     "Dialysis, low-protein diet, transplant and creatinine monitoring.", "kidney", "#14b8a6"),
    ("mental", "سلامت روان", "Mental Health", "افسردگی، اضطراب، دارودرمانی و روان‌درمانی.",
     "Depression, anxiety, medication and psychotherapy.", "sparkle", "#f59e0b"),
]

NAMES = ["نیلوفر", "سارا", "مریم", "زهرا", "الهام", "رضا", "امیر", "حسین", "پیمان", "کاوه",
         "شیرین", "بهناز", "فرزانه", "آرش", "سهیل", "مینا", "پریسا", "بابک", "نگار", "کیان"]
LAST = ["م.", "ک.", "ر.", "ص.", "ط.", "ن.", "ه.", "ب."]

SYMPTOMS = {
    "diabetes": ["خستگی", "تشنگی زیاد", "تاری دید", "بی‌حسی پا"],
    "ms": ["خستگی", "بی‌حسی اندام", "اختلال تعادل", "تاری دید"],
    "cancer": ["تهوع", "خستگی", "بی‌اشتهایی", "درد"],
    "cardio": ["تنگی نفس", "تپش قلب", "ورم پا", "خستگی"],
    "kidney": ["خارش پوست", "ورم پا", "خستگی", "کم‌اشتهایی"],
    "mental": ["بی‌خوابی", "اضطراب", "کم‌انگیزگی", "تمرکز پایین"],
}
DRUGS = {
    "diabetes": [("متفورمین", "۱۰۰۰ میلی‌گرم"), ("انسولین گلارژین", "۲۰ واحد"), ("امپاگلیفلوزین", "۱۰ میلی‌گرم")],
    "ms": [("اینترفرون بتا", "۴۴ میکروگرم"), ("فینگولیمود", "۰.۵ میلی‌گرم"), ("ریتوکسیمب", "۱ گرم")],
    "cancer": [("کاپسیتابین", "۱۵۰۰ میلی‌گرم"), ("تاموکسیفن", "۲۰ میلی‌گرم"), ("اندانسترون", "۸ میلی‌گرم")],
    "cardio": [("آتورواستاتین", "۲۰ میلی‌گرم"), ("لوزارتان", "۵۰ میلی‌گرم"), ("بیزوپرولول", "۵ میلی‌گرم")],
    "kidney": [("سویلامر", "۸۰۰ میلی‌گرم"), ("اریتروپویتین", "۴۰۰۰ واحد"), ("فوروزماید", "۴۰ میلی‌گرم")],
    "mental": [("سرترالین", "۵۰ میلی‌گرم"), ("بوپروپیون", "۱۵۰ میلی‌گرم"), ("کوئتیاپین", "۲۵ میلی‌گرم")],
}
LABS = {
    "diabetes": [("HbA1c", "%", 7.4, 0.6), ("قند ناشتا", "mg/dL", 132, 22)],
    "ms": [("ویتامین D", "ng/mL", 31, 7)],
    "cancer": [("هموگلوبین", "g/dL", 11.6, 1.1)],
    "cardio": [("فشار سیستولیک", "mmHg", 134, 12), ("LDL", "mg/dL", 118, 20)],
    "kidney": [("کراتینین", "mg/dL", 2.1, 0.4), ("GFR", "mL/min", 41, 8)],
    "mental": [("امتیاز PHQ-9", "", 11, 3)],
}
SIDE = ["تهوع خفیف", "سرگیجه", "خواب‌آلودگی", "", "", "سردرد", ""]

POSTS = [
    ("diabetes", "بعد از ۶ ماه، HbA1c از ۹.۲ به ۷.۱ رسید", "experience",
     "سه تغییر ساده داشتم: پیاده‌روی ۳۰ دقیقه بعد از شام، جایگزین کردن نان سفید با سنگک سبوس‌دار و اندازه‌گیری قند دو ساعت بعد از غذا به‌جای فقط ناشتا. دارو تغییر نکرد. مهم‌ترین نکته برای من این بود که روند را هفتگی ببینم نه روزانه؛ نوسان روزانه فقط استرس می‌آورد."),
    ("diabetes", "کسی با امپاگلیفلوزین عفونت ادراری گرفته؟", "question",
     "سه هفته است شروع کرده‌ام و قند بهتر شده، اما دو بار علائم عفونت داشتم. پزشکم گفت شایع است. دوست دارم بدانم تجربه بقیه چه بوده و آیا با گذشت زمان کمتر شد؟"),
    ("ms", "مدیریت خستگی: چیزی که واقعاً برای من جواب داد", "tip",
     "خستگی ام‌اس با خستگی معمولی فرق دارد. چیزی که کمک کرد: تقسیم کارها به بلوک‌های ۲۰ دقیقه‌ای، خواب نیم‌ساعته بعدازظهر قبل از رسیدن به مرز خستگی، و دوری از گرما. ثبت روزانه شدت خستگی کمک کرد الگو را ببینم — بدترین روزها بعد از شب‌های کم‌خواب بودند."),
    ("ms", "اولین حمله بعد از دو سال آرامش", "experience",
     "هفته گذشته بی‌حسی سمت راست برگشت. MRI ضایعه فعال نشان داد و پالس‌تراپی شروع شد. نوشتن اینجا کمک می‌کند کمتر احساس تنهایی کنم. اگر تجربه مشابه دارید، بازگشت به حالت قبل چقدر طول کشید؟"),
    ("cancer", "تهوع شیمی‌درمانی: چه چیزهایی کمک کرد", "tip",
     "زنجبیل تازه، غذای کم‌حجم و مکرر، و مصرف داروی ضدتهوع قبل از شروع تهوع نه بعد از آن. همچنین یخ در دهان هنگام تزریق برای زخم دهان کمک کرد. اینها جای توصیه پزشک را نمی‌گیرد، فقط تجربه من است."),
    ("cardio", "فشار خونم با نمک کمتر ۱۴ واحد پایین آمد", "experience",
     "سه ماه غذای بیرون را قطع کردم و نمک پنهان را جدی گرفتم. میانگین سیستولیک از ۱۴۸ به ۱۳۴ رسید. دوز دارو ثابت ماند. نمودار ماهانه در پیش‌خوان خیلی انگیزه‌دهنده بود."),
    ("kidney", "زندگی با دیالیز سه بار در هفته", "experience",
     "برنامه‌ریزی کار و سفر سخت‌ترین بخش است. مرکز دیالیز صبح زود را انتخاب کردم تا بقیه روز آزاد باشم. محدودیت مایعات هنوز سخت‌ترین قسمت است — یخ‌های کوچک به‌جای لیوان آب کمک می‌کند."),
    ("mental", "قطع تدریجی سرترالین با نظر پزشک", "question",
     "بعد از یک سال و نیم حالم پایدار است و پزشکم پیشنهاد کاهش تدریجی داده. کسی تجربه کاهش دوز دارد؟ چقدر طول کشید و چه علائمی داشتید؟"),
    ("mental", "ثبت روزانه خلق، بهترین کاری بود که کردم", "tip",
     "شش ماه است هر شب خلق و خواب را ثبت می‌کنم. الگو واضح شد: زیر ۶ ساعت خواب یعنی روز بعد اضطراب بالا. این نمودار را به روان‌پزشکم نشان دادم و کمک کرد تصمیم دارویی دقیق‌تری بگیریم."),
    ("cancer", "برگشت به کار بعد از درمان", "question",
     "سه ماه از پایان شیمی‌درمانی گذشته و می‌خواهم پاره‌وقت برگردم. کسی تجربه مذاکره با کارفرما برای ساعت منعطف دارد؟"),
]
COMMENTS = [
    "خیلی ممنون که نوشتی، دقیقاً همین را تجربه کردم.",
    "من هم اوایل همین مشکل را داشتم، بعد از دو ماه خیلی بهتر شد.",
    "لطفاً حتماً با پزشک خودت هم مطرح کن، ولی تجربه من مشابه بود.",
    "این نکته‌ی تقسیم کارها را امتحان می‌کنم، ممنون.",
    "برای من برعکس بود؛ بدن هر کسی فرق می‌کند.",
    "نمودار روندت را اگر بتوانی بگذاری خیلی کمک می‌کند.",
    "قوی باشی، ما کنارت هستیم.",
]


def seed() -> None:
    with Session(engine) as s:
        if s.exec(select(Condition)).first():
            return
        rnd = random.Random(1405)
        conds = {}
        for slug, fa, en, bfa, ben, icon, accent in CONDITIONS:
            c = Condition(slug=slug, name_fa=fa, name_en=en, blurb_fa=bfa, blurb_en=ben,
                          icon=icon, accent=accent)
            s.add(c)
            s.commit()
            s.refresh(c)
            conds[slug] = c

        demo = User(email="demo@hamrahsalamat.ir", password_hash=hash_password("demo1234"),
                    display_name="کاربر نمونه", city="تهران", year_of_birth=1364,
                    gender="f", role="patient", research_consent=True, avatar_seed="7",
                    bio="۸ سال با دیابت نوع ۲ زندگی می‌کنم و روند قندم را اینجا ثبت می‌کنم.")
        s.add(demo)
        s.commit()
        s.refresh(demo)

        users = [demo]
        for i in range(64):
            slug = CONDITIONS[i % len(CONDITIONS)][0]
            u = User(email=f"user{i}@example.com", password_hash=hash_password("demo1234"),
                     display_name=f"{rnd.choice(NAMES)} {rnd.choice(LAST)}",
                     city=rnd.choice(["تهران", "کرج", "مشهد", "اصفهان", "شیراز", "تبریز"]),
                     year_of_birth=rnd.randint(1340, 1385),
                     gender=rnd.choice(["f", "m"]),
                     role=rnd.choice(["patient"] * 8 + ["caregiver", "clinician"]),
                     research_consent=rnd.random() < 0.75,
                     avatar_seed=str(i % 60))
            s.add(u)
            s.commit()
            s.refresh(u)
            users.append(u)
            s.add(Membership(user_id=u.id, condition_id=conds[slug].id))
            if rnd.random() < 0.25:
                other = rnd.choice(CONDITIONS)[0]
                if other != slug:
                    s.add(Membership(user_id=u.id, condition_id=conds[other].id))
        for slug in ("diabetes", "mental"):
            s.add(Membership(user_id=demo.id, condition_id=conds[slug].id))
        s.commit()

        for c in conds.values():
            c.member_count = len(s.exec(select(Membership).where(Membership.condition_id == c.id)).all())
            s.add(c)
        s.commit()

        now = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
        memberships = s.exec(select(Membership)).all()
        by_user: dict[int, str] = {}
        for m in memberships:
            cond = s.get(Condition, m.condition_id)
            by_user.setdefault(m.user_id, cond.slug)

        for u in users:
            slug = by_user.get(u.id, "diabetes")
            cond = conds[slug]
            base = rnd.uniform(3.5, 6.5)
            drift = rnd.uniform(-0.02, 0.01)
            n_days = 150 if u.id == demo.id else rnd.randint(30, 120)
            for d in range(n_days, 0, -1):
                if u.id != demo.id and rnd.random() < 0.45:
                    continue
                when = now - dt.timedelta(days=d, hours=rnd.randint(0, 12))
                sev = max(0.5, min(10, base + drift * (n_days - d)
                                   + 1.2 * math.sin(d / 9) + rnd.uniform(-0.8, 0.8)))
                s.add(Entry(user_id=u.id, condition_id=cond.id, kind="symptom",
                            label=rnd.choice(SYMPTOMS[slug]), value=round(sev, 1),
                            unit="۰ تا ۱۰", recorded_at=when))
                if rnd.random() < 0.8:
                    s.add(Entry(user_id=u.id, condition_id=cond.id, kind="quality",
                                label="کیفیت زندگی", value=round(max(1, min(10, 11 - sev + rnd.uniform(-1, 1))), 1),
                                unit="۰ تا ۱۰", recorded_at=when))
                if rnd.random() < 0.7:
                    s.add(Entry(user_id=u.id, condition_id=cond.id, kind="treatment",
                                label="پایبندی دارویی", value=round(rnd.uniform(70, 100)),
                                unit="٪", recorded_at=when))
                if d % 21 == 0:
                    for lab, unit, mean, sd in LABS[slug]:
                        s.add(Entry(user_id=u.id, condition_id=cond.id, kind="lab", label=lab,
                                    value=round(rnd.gauss(mean, sd), 1), unit=unit, recorded_at=when))
            for name, dose in rnd.sample(DRUGS[slug], k=rnd.randint(1, 3)):
                s.add(Treatment(user_id=u.id, condition_id=cond.id, name=name, dosage=dose,
                                purpose=f"کنترل {cond.name_fa}", effectiveness=rnd.randint(2, 5),
                                side_effects=rnd.choice(SIDE), active=rnd.random() < 0.8,
                                started_at=now - dt.timedelta(days=rnd.randint(40, 900))))
            s.commit()

        pool = [u for u in users if u.id != demo.id]
        for slug, title, kind, body in POSTS:
            author = rnd.choice(pool)
            p = Post(user_id=author.id, condition_id=conds[slug].id, title=title, body=body,
                     kind=kind, likes=rnd.randint(4, 48),
                     created_at=now - dt.timedelta(days=rnd.randint(0, 40), hours=rnd.randint(0, 20)))
            s.add(p)
            s.commit()
            s.refresh(p)
            for _ in range(rnd.randint(1, 4)):
                c = Comment(post_id=p.id, user_id=rnd.choice(pool).id, body=rnd.choice(COMMENTS),
                            created_at=p.created_at + dt.timedelta(hours=rnd.randint(1, 60)))
                s.add(c)
            s.commit()
