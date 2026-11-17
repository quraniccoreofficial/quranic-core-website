import subprocess,sys,json,time
from playwright.sync_api import sync_playwright
ROOT=sys.argv[1] if len(sys.argv)>1 else 'website'
srv=subprocess.Popen(['python3','-m','http.server','8765','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
B='http://localhost:8765';F='https://forms.gle/yGg4RL3G1WLK3E2V6';CAL='https://calendly.com/quraniccore-official/30min';IG='https://www.instagram.com/quraniccore.official/';WC='https://whatsapp.com/channel/0029Vb9dNeJ7j6g1M5VuFB1K';FB='https://www.facebook.com/share/1EQm1bhf5L/'
paths=['/','/about/','/courses/','/courses/quran-nazra/','/courses/qaida/','/courses/basic-arabic-learning/','/courses/hifz-revision/','/teachers/','/how-it-works/','/free-trial/','/contact/','/faq/','/follow-us/','/ask-a-question/','/privacy-policy/','/404.html']
res={'fail':[],'ok':0};ext=set()
def ck(n,c,info=''):
    if c:res['ok']+=1
    else:res['fail'].append(n+' '+str(info));print('FAIL',n,info)
with sync_playwright() as p:
    br=p.chromium.launch()
    def ctx(scheme='light',w=1440,h=900):
        c=br.new_context(viewport={'width':w,'height':h},color_scheme=scheme)
        c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://localhost') else r.abort());return c
    # A: all pages x sizes x themes
    errs=[]
    for scheme in ['light','dark']:
        for w,h in [(1440,900),(1024,768),(768,1024),(390,844)]:
            c=ctx(scheme,w,h);pg=c.new_page()
            pg.on('pageerror',lambda e:errs.append(str(e)))
            pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'Failed to load' not in m.text and 'net::' not in m.text else None)
            for u in paths:
                pg.goto(B+u,wait_until='load');pg.wait_for_timeout(120)
                sw=pg.evaluate('document.documentElement.scrollWidth-innerWidth');bw=pg.evaluate('document.body.scrollWidth-innerWidth')
                ck(f'no h-scroll {u} {w} {scheme}',sw<=0 and bw<=0,(sw,bw))
                ck(f'theme attr {u}',pg.evaluate('document.documentElement.dataset.theme')==scheme)
                if u!='/404.html':ck(f'one h1 {u}',pg.locator('h1').count()==1)
                for a in pg.eval_on_selector_all('a[href^=http]','e=>e.map(x=>x.href)'):ext.add(a.split('?')[0])
            if w in(1440,390):
                for u,n in [('/','home'),('/follow-us/','follow'),('/ask-a-question/','ask')]:
                    pg.goto(B+u);pg.wait_for_timeout(500);pg.screenshot(path=f'/tmp/shots/{n}-{w}-{scheme}.png')
            c.close()
    ck('no JS errors',not errs,errs[:3])
    # B: hero CTAs
    c=ctx();pg=c.new_page();pg.goto(B+'/');a=pg.eval_on_selector_all('.bt3 a','e=>e.map(x=>[x.innerText.replace(/\\s+/g," "),x.href,x.target,x.rel])')
    print('HERO',a);ck('3 hero buttons',len(a)==3);hs=[x[1] for x in a]
    ck('distinct destinations',len(set(hs))==3);ck('trial->calendly',a[0][1]==CAL and 'FREE 30-Minute Trial Class' in a[0][0] and a[0][2]=='_blank' and 'noopener' in a[0][3])
    ck('explore->courses',a[1][1]==B+'/courses/');ck('enroll->form',a[2][1]==F and a[2][2]=='_blank')
    bx=pg.eval_on_selector_all('.bt3 a','e=>e.map(x=>{const r=x.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]})');print('hero btn sizes',bx);ck('small buttons equal size',bx[1]==bx[2])
    # C: desktop dropdown
    pg.hover('.dt');pg.wait_for_timeout(350);ck('dropdown visible on hover',pg.locator('#dm').is_visible())
    L=pg.eval_on_selector_all('#dm a','e=>e.map(x=>[x.innerText,new URL(x.href).pathname])');print('DROPDOWN',L)
    ck('dropdown order',[l[0] for l in L]==['All Courses','Quran Nazra','Qaida','Hifz Revision (Manzil)','Basic Arabic Learning'],L)
    ck('main nav labels',pg.eval_on_selector_all('#mn>.l,#mn>.dd>.dt','e=>e.map(x=>x.innerText.trim())')==['Home','About Us','Courses','Teachers','How It Works','Follow Us','Contact'],pg.eval_on_selector_all('#mn>.l,#mn>.dd>.dt','e=>e.map(x=>x.innerText.trim())'))
    for n,u in L:
        r=pg.goto(B+u);ck('dropdown link ok '+u,r.status==200 and pg.locator('h1').count()==1)
    pg.goto(B+'/');pg.click('.dt');ck('click toggles dd open',pg.get_attribute('.dt','aria-expanded')=='true');pg.keyboard.press('Escape');ck('Escape closes',pg.get_attribute('.dt','aria-expanded')=='false')
    for u in ['/','/about/','/teachers/','/how-it-works/','/follow-us/','/contact/']:
        pg.goto(B+u);ck('nav active '+u,pg.locator('#mn .l.on').count()>=1)
    pg.goto(B+'/courses/qaida/');ck('Courses nav active on course page',pg.locator('.dt.on').count()==1 and pg.locator('#dm a.on').count()==1)
    # course page CTAs + trial/contact/footer
    hr=pg.eval_on_selector_all('main .bt a','e=>e.map(x=>x.href)');ck('course page CTAs',hr==[CAL,F],hr)
    pg.goto(B+'/free-trial/');hr=pg.eval_on_selector_all('main .bt a','e=>e.map(x=>x.href)');ck('trial page CTA calendly',hr[0]==CAL,hr)
    pg.goto(B+'/follow-us/');hr=pg.eval_on_selector_all('.sc a','e=>e.map(x=>x.href)');ck('follow cards official links',hr==[IG,FB,WC],hr)
    fl=pg.eval_on_selector_all('footer a','e=>e.map(x=>x.getAttribute("href"))');print('FOOTER',fl)
    for need in ['/','/about/','/courses/','/teachers/','/how-it-works/','/follow-us/','/contact/','/ask-a-question/',IG,FB,WC,F,CAL,'/courses/quran-nazra/','/courses/qaida/','/courses/hifz-revision/','/courses/basic-arabic-learning/']:ck('footer has '+need,need in fl)
    c.close()
    # mobile nav
    c=ctx('light',390,844);pg=c.new_page();pg.goto(B+'/');ck('mobile menu hidden',not pg.locator('#mn').is_visible());pg.click('#mb');pg.wait_for_timeout(300)
    ck('mobile menu opens',pg.locator('#mn').is_visible() and pg.get_attribute('#mb','aria-expanded')=='true');ck('mobile dd collapsed',not pg.locator('#dm').is_visible())
    pg.click('.dt');ck('mobile accordion expands',pg.locator('#dm').is_visible() and pg.locator('#dm a').count()==5);pg.screenshot(path='/tmp/shots/mobile-menu.png')
    pg.click('#dm a:nth-child(3)');pg.wait_for_url('**/courses/qaida/');ck('mobile course link works',True)
    ck('theme toggle visible on mobile bar',pg.locator('#th').is_visible());c.close()
    # D: theme
    c=ctx('dark');pg=c.new_page();pg.goto(B+'/');ck('system dark respected',pg.evaluate('document.documentElement.dataset.theme')=='dark')
    pg.click('#th');pg.wait_for_timeout(500);ck('toggle->light',pg.evaluate('document.documentElement.dataset.theme')=='light' and pg.evaluate('localStorage.getItem("qc-theme")')=='light')
    pg.goto(B+'/about/');ck('persists across navigation',pg.evaluate('document.documentElement.dataset.theme')=='light');pg.reload();ck('persists after reload',pg.evaluate('document.documentElement.dataset.theme')=='light')
    ck('aria-label updates',pg.get_attribute('#th','aria-label')=='Switch to dark mode');c.close()
    # E: ask form
    c=ctx();pg=c.new_page();reqs=[];mode={'m':'ok'}
    def h(route):
        reqs.append(route.request.post_data)
        if mode['m']=='ok':route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
        elif mode['m']=='500':route.fulfill(status=502,content_type='application/json',body='{"ok":false}')
        elif mode['m']=='net':route.abort()
        else:time.sleep(.8);route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
    pg.route('**/api/ask',h);pg.goto(B+'/ask-a-question/')
    pg.click('#af button');ck('empty submit blocked',len(reqs)==0 and pg.locator('.fe:not(:empty)').count()==4)
    pg.fill('[name=name]','Test User');pg.fill('[name=email]','bad@');pg.fill('[name=subject]','Hi');pg.fill('[name=message]','short');pg.click('#af button');ck('invalid email/short fields blocked',len(reqs)==0 and 'valid email' in pg.inner_text('#e-email'))
    def fill():
        pg.fill('[name=name]','Test User');pg.fill('[name=email]','test@example.com');pg.fill('[name=subject]','Course question');pg.fill('[name=message]','Do you offer Qaida for adults in the evening?')
    fill();mode['m']='net';pg.click('#af button');pg.wait_for_selector('#as.bad');ck('network failure -> error, no success',('could not be sent' in pg.inner_text('#as')) and 'Thank you' not in pg.inner_text('#as'))
    mode['m']='500';pg.click('#af button');pg.wait_for_function('document.querySelector("#as.bad")&&!document.querySelector("#af button").disabled');ck('server 502 -> error, no success','Thank you' not in pg.inner_text('#as') and pg.locator('#as.ok').count()==0)
    mode['m']='ok';pg.click('#af button');pg.wait_for_selector('#as.ok');ck('success only after server ok:true','Thank you' in pg.inner_text('#as') and pg.is_disabled('#af button'))
    pl=json.loads(reqs[-1]);ck('payload',pl['email']=='test@example.com' and pl['t']>=0 and pl['website']=='',pl)  # loading state + duplicate guard: see form-and-hash-test.py
    c.close()
    # F: external links
    print('EXTERNAL',sorted(ext));allowed={F,CAL,IG,FB,WC,'https://wa.me/923719079975'}
    ck('only official external links',all(e in allowed or e.startswith('https://fonts.') or e.startswith('https://cdnjs.') for e in ext),ext-allowed)
    br.close()
srv.terminate();print('PASSED',res['ok'],'FAILED',len(res['fail']))
