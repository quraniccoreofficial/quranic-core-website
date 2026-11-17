import subprocess,time,json
from playwright.sync_api import sync_playwright
srv=subprocess.Popen(['python3','-m','http.server','8765','-d',(__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'website')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
ok=0;bad=[]
def ck(n,c,i=''):
    global ok
    if c:ok+=1
    else:bad.append(n);print('FAIL',n,i)
with sync_playwright() as p:
    br=p.chromium.launch()
    def ctx(w=1440,h=900,s='light'):
        c=br.new_context(viewport={'width':w,'height':h},color_scheme=s);c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(('http://localhost','file://')) else r.abort());return c
    # loading state + duplicate prevention (fetch stub held for 1s)
    pg=ctx().new_page();pg.goto('http://localhost:8765/ask-a-question/')
    pg.evaluate('window.__n=0;window.fetch=()=>{window.__n++;return new Promise(r=>setTimeout(()=>r(new Response(\'{"ok":true}\',{status:200})),1000))};0')
    pg.fill('[name=name]','Test User');pg.fill('[name=email]','test@example.com');pg.fill('[name=subject]','Course question');pg.fill('[name=message]','Do you offer Qaida for adults in the evening?')
    pg.wait_for_timeout(3200);pg.click('#af button');pg.wait_for_timeout(200)
    ck('loading state shown',pg.locator('#af button.ld').count()==1 and pg.is_disabled('#af button') and 'SENDING' in pg.inner_text('#af button'))
    ck('no success while pending',pg.locator('#as.ok').count()==0)
    pg.evaluate('document.querySelector("#af").requestSubmit();document.querySelector("#af").requestSubmit()');pg.wait_for_selector('#as.ok',timeout=4000)
    ck('exactly one request despite repeat submits',pg.evaluate('window.__n')==1,pg.evaluate('window.__n'))
    ck('success text after ok',  'Thank you' in pg.inner_text('#as') and pg.is_disabled('#af button'))
    # hash-mode single file (the published artifact)
    errs=[];c=ctx();pg=c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'Failed to load' not in m.text and 'net::' not in m.text else None)
    U='file://'+__import__('os').path.abspath('quranic-core.html');pg.goto(U);pg.wait_for_timeout(300)
    for k in ['home','about','courses','nazra','qaida','arabic','hifz','teachers','how','trial','follow','ask','contact','faq','privacy']:
        pg.evaluate(f'location.hash="#{k}"');pg.wait_for_timeout(120)
        ck('hash route '+k,pg.locator('#app h1').count()==1 and pg.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    pg.evaluate('location.hash="#home"');pg.wait_for_timeout(200)
    a=pg.eval_on_selector_all('.bt3 a','e=>e.map(x=>x.getAttribute("href"))');ck('hash hero CTAs',a==['https://calendly.com/quraniccore-official/30min','#courses','https://forms.gle/yGg4RL3G1WLK3E2V6'],a)
    pg.hover('.dt');pg.wait_for_timeout(300);ck('hash dropdown',pg.locator('#dm').is_visible());pg.click('#dm a:nth-child(2)');pg.wait_for_timeout(200);ck('hash dropdown nav',pg.evaluate('location.hash')=='#nazra' and pg.locator('.dt.on').count()==1)
    pg.click('#th');ck('hash theme toggle',pg.evaluate('document.documentElement.dataset.theme')=='dark')
    pg.evaluate('location.hash="#ask"');pg.wait_for_timeout(200);pg.click('#af button');ck('hash form validates',pg.locator('.fe:not(:empty)').count()==4)
    ck('no JS errors (hash mode)',not errs,errs[:3]);c.close()
    # mobile hash layout
    c=ctx(390,844);pg=c.new_page();pg.goto(U);pg.wait_for_timeout(300);pg.screenshot(path='/tmp/hash-home-390.png');ck('hash mobile no h-scroll',pg.evaluate('document.documentElement.scrollWidth<=innerWidth'));c.close()
    br.close()
srv.terminate();print('PASSED',ok,'FAILED',len(bad))
