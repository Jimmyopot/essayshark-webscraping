const Queue = require('./line');
const {Builder, By, Key, util, WebDriver, Capabilities, until} = require("selenium-webdriver")
const chrome = require("selenium-webdriver/chrome")
const chromedriver = require("chromedriver")
const WebSocket = require('ws');

require('dotenv').config()


chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const driver = new Builder()
                 .withCapabilities(Capabilities.chrome())
                 .build();


function sharkOrder() {
    const socket = new WebSocket("wss://box1.essayshark.com/live/ws/to_writers?");

    // 1. ONOPEN

    socket.onopen = function(event) {  
        console.log("Connection established, EssayShark WebSockets.");  
        console.log("You have logged in, wait for an order.");
    }


    socket.onclose = function(event) {    
        const code = event.code;    
        const reason = event.reason;    
        const wasClean = event.wasClean;    
        
        if (wasClean) {      
            console.log("Connection closed normally.");    
        }    
        else {      
            console.log("Connection closed with message: " + reason + " (Code: " + code + ")");    
        }  
    }


    socket.onerror = function(event) {    
        console.log("WebSocket Error: " , event);   
        // handleErrors(event);  
    } 


    // Listen for messages

    socket.onmessage = function(event) {
        //create a JSON object
        let jsonObject = JSON.parse(event.data);
        let text = jsonObject.text;
        let tag = jsonObject.tag;
            
        console.log(text);
        const parseData = JSON.parse(text);
        // console.log(parseData.order);

        if (parseData.status_from === 0 && parseData.status_to === 20) {
            console.log(parseData.order);
            
            const store_orders = new Queue();
            
            store_orders.enqueue(parseData.order);
            console.log(store_orders);

            let x = parseData.order;

            const base_url = "https://essayshark.com/writer/orders/";
            let order_variable = x;
            driver.get(base_url + order_variable + ".html");
            
            // Variables
            essayShark_name = process.env.ESSAYSHARK_NAME
            essayShark_pass = process.env.ESSAYSHARK_PASS

            // Click the account button
            driver.findElement(By.id("id_esauth_myaccount_login_link")).click();
            driver.findElement(By.id("es-cookie-button-submit")).click();

            driver.findElement(By.id("id_esauth_login_field")).sendKeys(essayShark_name);
            driver.findElement(By.id("id_esauth_pwd_field")).sendKeys(essayShark_pass);

            // Click the submit button
            driver.findElement(By.className("input_submit")).click();

            // Click the recommended bid...
            // let rec_bid = driver.wait(until.elementLocated(By.id("rec_bid")), 20000);
            // rec_bid.click();
            driver.findElement(By.id("rec_bid")).click();

            // Click the bid button
            let apply_button = driver.wait(until.elementLocated(By.id("apply_order")), 20000);
            apply_button.click();
            // driver.findElement(By.id("apply_order")).click();            
        }    
        
    }
}

sharkOrder();


