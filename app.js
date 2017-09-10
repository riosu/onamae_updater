const puppeteer = require('puppeteer');

(async () => {
    username = process.env.USERNAME
    password = process.env.PASSWORD
    domain = process.env.DOMAIN
    subdomains = process.env.SUBDOMAINS.split(",")
    ip_full = process.env.IP
    ip = ip_full.split(".")

    console.log("Initialize chrome-headless.")
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log("Open and Login to onamae.com.")
    await page.goto("https://www.onamae.com/navi/domain.html");
    await page.focus("#username")
    await page.type(username)
    await page.focus("#password")
    await page.type(password)
    const elmLoginButton = await page.$("#btnLogin")
    await elmLoginButton.click()
    await page.waitForNavigation({waitUntil: "load"})

    console.log("Select target domain radio button.")
    await page.goto("https://www.onamae.com/domain/navi/dns_manage")
    const elmDNSRadiobutton = await page.$(".domainInternal[value='"+domain+"']")
    if (elmDNSRadiobutton == null) {
        console.log("Erorr: domain is not found.")
        browser.close();
        return
    }
    await elmDNSRadiobutton.click()
    await page.evaluate("submitform('external','internal_list')")
    await page.waitForNavigation({waitUntil: "load"})

    console.log("Open domain setting page.")
    await page.evaluate("submitAction('dns_controll_input')")
    await page.waitForNavigation({waitUntil: "load"})

    console.log("Update dns records.")
    for(let subdomain of subdomains) {
        hostnameId = await page.evaluate("$(\"input[value='"+subdomain+"'\").attr(\"id\")")
        targetNumber = hostnameId.match("hostNameUsed(.*)")[1]
        console.log("\t"+subdomain+":"+ip_full+" (row:"+targetNumber+")")
        await page.evaluate("$(\"#add_recvalue_used_A1"+targetNumber+"\").val(\"\")")
        await page.focus("#add_recvalue_used_A1"+targetNumber)
        await page.type(ip[0])
        await page.evaluate("$(\"#add_recvalue_used_A2"+targetNumber+"\").val(\"\")")
        await page.focus("#add_recvalue_used_A2"+targetNumber)
        await page.type(ip[1])
        await page.evaluate("$(\"#add_recvalue_used_A3"+targetNumber+"\").val(\"\")")
        await page.focus("#add_recvalue_used_A3"+targetNumber)
        await page.type(ip[2])
        await page.evaluate("$(\"#add_recvalue_used_A4"+targetNumber+"\").val(\"\")")
        await page.focus("#add_recvalue_used_A4"+targetNumber)
        await page.type(ip[3])
    }

    await page.evaluate("submitdns_controllForm()")
    await page.waitForNavigation({waitUntil: "load"})

    console.log("Wait page refresh.")
    await page.evaluate("submitDnsconfirmForm()")
    await page.waitFor(15000)
    console.log("Completed.")
    browser.close();

})().catch(err => {
    console.error(err);
})