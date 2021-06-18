const CURRENT_URL = window.location.href;
const DEV_MODE = true;
const DEV_MODE_INFO = true;

const main = async () => {
  let result;
  try {
    result = await getParser();
  } catch (error) {
    console.error(error);
  }

  if (result) {
    let postData = {
      price: formatNumber(result),
      url: CURRENT_URL
    }
    console.log("postData: " + JSON.stringify(postData))
    // sendPriceToMainApp(postData)
  }
};


//  CLIENT OPERATIONS
const getInnerText = (xpaths) => {
  for (const xpath of xpaths) {
    try {
      if (DEV_MODE) console.log('current target is: ' + xpath);
      let target = $(xpath);
      let price;
      if (target[0] && target[0].innerHTML) {
        price = target[0].innerText.trim();
      } else if (target && target.innerHTML) {
        price = target.innerText.trim();
      } else
        continue;

      if (price) {
        if (DEV_MODE) target.css("border", "4px solid blue");
        return price;
      }
    } catch (error) {
      if (DEV_MODE) console.error(error);
    }
  }
}
const getParser = async () => {
  let xpaths;
  let currentDomain = await getDomain();
  if (currentDomain == "www.atasunoptik.com.tr") {
    xpaths = ['.new-price'];
  }
  else if (currentDomain == "www.hepsiburada.com") {
    xpaths = ['.extra-discount-price', '#offering-price'];
  }
  else if (currentDomain == "www.amazon.com" || currentDomain == "www.amazon.de") {
    xpaths = ['#price_inside_buybox', '#rentPrice', '#newBuyBoxPrice', '#priceblock_ourprice', '#eBookTab .header-price', '.a-size-base.a-color-price'];
  }
  else if (currentDomain == "www.trendyol.com") {
    xpaths = ['.prc-dsc', '.prc-slg', '.prc-org'];
  }
  else if (currentDomain == "www.bestbuy.com") {
    xpaths = ['.price-box.pricing-lib-price-8-2123-16 > div:nth-child(1) > div:nth-child(1) > div > span:nth-child(1)','.priceView-hero-price.priceView-customer-price > span:nth-child(1)'];
  }
  
  else {
    if (DEV_MODE) {
      console.error("This website is not mapped but in manifest file. CurretDomain: " + currentDomain)
    }
    return null;
  }
  return getInnerText(xpaths);
}


//  DB OPERATIONS
const sendPriceToMainApp = (postData) => {
  $.ajax({
    type: "POST",
    url: 'http://localhost:8080/compelisCore/' + '/actions/sendPriceToMainApp',
    dataType: 'json',
    async: false,
    data: postData,
    success: function (res) {
      console.log('res: ' + JSON.stringify(res))
    },
    error: function () {
      console.log(postData.price);
    }
  });
}
const getPriceHistoryFromMainApp = (postData) => {
  $.ajax({
    type: "POST",
    url: 'http://localhost:8080/compelisCore/' + '/actions/getPriceHistoryFromMainApp',
    dataType: 'json',
    async: false,
    data: postData,
    success: function (res) {
      console.log('res: ' + JSON.stringify(res))
    },
    error: function () {
      alert(postData);
    }
  });
}


//  UTILS
//samle:  https://www.atasunoptik.com.tr/guess-7600-01b-5519145-kadin-gunes-gozlukleri_81255 -> www.atasunoptik.com.tr
const getDomain = async () => {
  const result = await CURRENT_URL.split('//')[1].split('/')[0].split(':')[0];
  return Promise.resolve(result);
};
const formatNumber = (val) => {
  val = val.split(" ")[0].split("-")[0];
  val = val.replace(/[^0-9.,]/g, '');
  let comma = val.lastIndexOf(',');
  let point = val.lastIndexOf('.');
  if (comma === -1 && point === -1)
    return val;
  else if (comma > -1 && point === -1) { //189,99 123,436
    if (val.length - comma <= 3) //189,99
      val = val.replace(/,/g, ".");
    else //123,436
      val = val.replace(/,/g, "");
  }
  else if (comma === -1 && point > -1) { //189.99 123.436
    if (val.length - point > 3) //189,99
      val = val.replace(/\./g, "");
  }
  else { //1.483,21 € $2,498.00
    if (comma > point) {
      val = val.replace(/\./g, "");
      val = val.replace(/,/g, ".");
    }
    else {
      if (val.length - comma <= 3) //189,99
        val = val.replace(/,/g, ".");
      else //123,436
        val = val.replace(/,/g, "");
    }
  }
  return val;
}


main();