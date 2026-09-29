import puppeteer from 'puppeteer'
export interface CertificateData {
  participantName: string
  programName: string
  certificateType: 'completion' | 'participation'
  issueDate: string
  serialNumber: string
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const typeText = data.certificateType === 'completion' ? 'شهـادة إتـمام دورة تدريبيـة' : 'شهادة مشاركة في دورة تدريبية'
  
  const safeParticipantName = escapeHtml(data.participantName)
  const safeProgramName = escapeHtml(data.programName)
  const safeIssueDate = escapeHtml(data.issueDate)
  const safeSerial = escapeHtml(data.serialNumber)

  const htmlString = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة معتمدة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@700&family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: { 800: '#0e1e38', 900: '#091322', 950: '#050b14' },
                        gold: { 400: '#d8b263', 500: '#c5a059', 600: '#a3813e' },
                        jorGreen: '#007A3D', jorRed: '#CE1126'
                    },
                    fontFamily: {
                        cairo: ['Cairo', 'sans-serif'],
                        amiri: ['Amiri', 'serif'],
                        ruqaa: ['Aref Ruqaa', 'serif']
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .certificate-container {
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
        }
        @page { size: A4 landscape; margin: 0; }
        .cert-outer-border { border: 8px solid #0e1e38; outline: 3px solid #c5a059; outline-offset: -5px; }
        .cert-inner-frame { border: 1px solid rgba(197, 160, 89, 0.4); }
        .bg-subtle-pattern {
            background-color: #ffffff;
            background-image: radial-gradient(#0e1e380a 1.2px, transparent 1.2px), radial-gradient(#c5a0590a 1.2px, #ffffff 1.2px);
            background-size: 24px 24px;
            background-position: 0 0, 12px 12px;
        }
        .corner-ornament { width: 46px; height: 46px; position: absolute; z-index: 10; }
    </style>
</head>
<body class="bg-white text-slate-800 font-cairo antialiased flex flex-col items-center">
    <main class="certificate-container w-full h-screen bg-subtle-pattern text-slate-900 relative p-12 overflow-hidden flex flex-col justify-between cert-outer-border select-none">
        <div class="corner-ornament top-2 right-2 text-gold-500 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0,0 L100,0 L100,16 C48,16 16,48 16,100 L0,100 Z" opacity="0.9"/></svg>
        </div>
        <div class="corner-ornament top-2 left-2 rotate-90 text-gold-500 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0,0 L100,0 L100,16 C48,16 16,48 16,100 L0,100 Z" opacity="0.9"/></svg>
        </div>
        <div class="corner-ornament bottom-2 right-2 -rotate-90 text-gold-500 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0,0 L100,0 L100,16 C48,16 16,48 16,100 L0,100 Z" opacity="0.9"/></svg>
        </div>
        <div class="corner-ornament bottom-2 left-2 rotate-180 text-gold-500 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0,0 L100,0 L100,16 C48,16 16,48 16,100 L0,100 Z" opacity="0.9"/></svg>
        </div>

        <div class="absolute inset-4 cert-inner-frame pointer-events-none rounded-lg"></div>

        <header class="flex items-center justify-between border-b border-slate-200/90 pb-4 relative z-10 px-2">
            <div class="flex items-center gap-3">
                <div class="w-24 h-24 flex items-center justify-center relative"></div>
                <div class="text-right">
                    <h2 class="text-lg font-black text-navy-800 leading-tight">حزب المحافظين الأردني</h2>
                    <p class="text-xs font-bold text-gold-600">هوية • انتماء • مواطنة</p>
                    <p class="text-[10px] text-slate-400 font-sans tracking-wide">The Jordanian Conservative Party</p>
                </div>
            </div>
            <div class="flex flex-col items-center justify-center text-center px-4">
                <div class="flex items-center gap-1.5 mb-1.5">
                    <span class="w-7 h-1 bg-black rounded-full"></span>
                    <span class="w-7 h-1 bg-white border border-slate-300 rounded-full"></span>
                    <span class="w-7 h-1 bg-jorGreen rounded-full"></span>
                    <span class="w-7 h-1 bg-jorRed rounded-full"></span>
                </div>
                <span class="text-slate-600 text-xs font-bold tracking-widest">المملكة الأردنية الهاشمية</span>
                <span class="text-navy-900 text-sm font-extrabold mt-0.5">الأمانة العامة • الأكاديمية الحزبية</span>
            </div>
            <div class="flex items-center gap-3 flex-row-reverse text-left">
                <div class="w-24 h-24 flex items-center justify-center relative"></div>
                <div class="text-left">
                    <h2 class="text-lg font-black text-navy-800 leading-tight">الأكاديمية الحزبية</h2>
                    <p class="text-xs font-bold text-jorGreen">بناء القادة وصناعة المستقبل</p>
                    <p class="text-[10px] text-slate-400 font-sans tracking-wide">Party Academy</p>
                </div>
            </div>
        </header>

        <section class="text-center my-auto py-2 relative z-10 flex flex-col items-center justify-center">
            <div class="mb-3">
                <span class="inline-block py-0.5 px-4 text-xs font-bold tracking-widest text-gold-600 bg-gold-500/10 rounded-full border border-gold-400/30">
                    وثيقة رسمية معتمدة
                </span>
                <h1 class="text-5xl font-ruqaa font-bold text-navy-800 mt-2 tracking-wide drop-shadow-sm">${typeText}</h1>
            </div>
            <p class="text-base text-slate-700 font-medium mt-4">
                تَشهد إدارة الأكاديمية الحزبية في <span class="font-bold text-navy-800">حزب المحافظين الأردني</span> بأنّ الزميل(ـة):
            </p>
            <div class="w-full max-w-xl my-4 flex flex-col items-center justify-center min-h-[44px]">
                <div class="text-3xl font-amiri font-bold text-navy-900 tracking-wider">${safeParticipantName}</div>
                <div class="w-4/5 border-b-2 border-dashed border-gold-500 mt-1"></div>
                <span class="text-[11px] text-slate-400 font-medium mt-1">اسم المشارك / الحاصل على الشهادة</span>
            </div>
            <p class="text-base text-slate-700 font-medium">
                قد اجتاز(ت) بنجاح واقتدار كافة المتطلبات النظرية والعملية المقررة لـ:
            </p>
            <div class="w-full max-w-xl my-4 flex flex-col items-center justify-center min-h-[44px]">
                <div class="w-full flex justify-center items-center text-2xl font-bold font-cairo text-navy-800">${safeProgramName}</div>
                <div class="w-4/5 border-b-2 border-dashed border-gold-500 mt-1"></div>
                <span class="text-[11px] text-slate-400 font-medium mt-1">عنوان الدورة التدريبية</span>
            </div>
            <p class="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed mt-4">
                تقديراً للمشاركة الفاعلة والالتزام بنهج وبرامج الحزب التثقيفية، وترسيخاً لقيم العمل الوطني والمواطنة الفاعلة في مسيرة التنمية الحزبية الأردنية.
            </p>
        </section>

        <footer class="pt-3 border-t border-slate-200 grid grid-cols-3 items-end relative z-10 px-4">
            <div class="text-center">
                <div class="h-14 flex items-center justify-center"></div>
                <div class="w-44 mx-auto border-t-2 border-dashed border-slate-400 mb-1.5"></div>
                <p class="text-sm font-bold text-navy-800">مدير الأكاديمية الحزبية</p>
                <p class="text-[10px] text-slate-500">حزب المحافظين الأردني</p>
            </div>
            <div class="flex flex-col items-center justify-center">
                <div class="w-20 h-20 rounded-full border-4 border-gold-500 bg-gradient-to-br from-gold-400 to-gold-600 flex flex-col items-center justify-center text-navy-950 shadow-md p-1 text-center transform -translate-y-2">
                    <svg class="w-6 h-6 text-navy-950 mb-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    <span class="text-[9px] font-black uppercase tracking-tight">اعتماد رسمي</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-1 flex flex-col items-center">
                    <span>تحريراً في: <strong class="text-slate-800">${safeIssueDate}</strong></span>
                    <span class="text-[10px] text-slate-500 font-mono tracking-wider">${safeSerial}</span>
                </div>
            </div>
            <div class="text-center">
                <div class="h-14 flex items-center justify-center"></div>
                <div class="w-44 mx-auto border-t-2 border-dashed border-slate-400 mb-1.5"></div>
                <p class="text-sm font-bold text-navy-800">الأمين العام للحزب</p>
                <p class="text-[10px] text-slate-500">حزب المحافظين الأردني</p>
            </div>
        </footer>
    </main>
</body>
</html>`

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setContent(htmlString, { waitUntil: 'load' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    })
    return pdfBuffer
  } finally {
    await browser.close()
  }
}
