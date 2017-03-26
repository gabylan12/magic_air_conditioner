#include <FS.h>                   //this needs to be first, or it all crashes and burns...

#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino

//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager
#include <ArduinoJson.h>
#include <IRremoteESP8266.h>
#include "DHT.h"

ESP8266WebServer server(80);


//WIFI
String command;
StaticJsonBuffer<200> jsonBuffer;
JsonObject& jsonCommand = jsonBuffer.createObject();
char toChar[2500];


//IR
int RECV_PIN = 0; //an IR detector/demodulatord is connected to GPIO pin 2
IRrecv irrecv(RECV_PIN);
decode_results results;
String irRecord = "";
IRsend irsend(5); //an IR emitter led is connected to GPIO pin 4

//DHT
#define DHTPIN D1 
//#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321
DHT dht(DHTPIN, DHT22);

/* Just a little test message.  Go to http://192.168.4.1 in a web browser
 * connected to this access point to see it.
 */
void handleRoot() {
  server.send(200, "text/html", "<h1>OK</h1>");
}


void handleSensors() {
  digitalWrite(LED_BUILTIN, LOW);
  command = "";
 jsonCommand["temperature"] = dht.readTemperature();
 jsonCommand["humidity"] = dht.readHumidity();
 jsonCommand.printTo(command);
 server.send(200, "text/html", command);
 delay(500);                    
 digitalWrite(LED_BUILTIN, HIGH);
}

void handleRecord() {
  digitalWrite(LED_BUILTIN, LOW);
  
  irRecord.toCharArray(toChar,2500);

  jsonCommand["command"] = toChar;
  command = "";
  jsonCommand.printTo(command);
  server.send(200, "text/html", command);
  delay(500);                    
  digitalWrite(LED_BUILTIN, HIGH);
}



void handleCommand() {
  digitalWrite(LED_BUILTIN, LOW); 

  //receive message
  command = server.arg("command");
  
  unsigned int rawbuf[250];
  int k = 0;
  //decode message
  while(true){
    rawbuf[k++] = command.toInt();

    if(command.indexOf(' ') == -1){
      break;
    }
    command = command.substring(command.indexOf(' ')+1);
  }

  //send ir signal
   irsend.sendRaw(rawbuf,k,38);
  
  //response message
  jsonCommand["code"] = "OK";
  command = "";
  jsonCommand.printTo(command);
  server.send(200, "text/html", command);
  delay(500);                    
  digitalWrite(LED_BUILTIN, HIGH);

}

 
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println();

  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;

  //exit after config instead of connecting
  wifiManager.setBreakAfterConfig(true);

  pinMode(LED_BUILTIN, OUTPUT);     // Initialize the LED_BUILTIN pin as an output

  //reset settings - for testing
 // wifiManager.resetSettings();


  //tries to connect to last known settings
  //if it does not connect it starts an access point with the specified name
  //here  "AutoConnectAP" with password "password"
  //and goes into a blocking loop awaiting configuration
  if (!wifiManager.autoConnect("MAGIC AIR")) {
    Serial.println("failed to connect, we should reset as see if it connects");
    delay(3000);
    ESP.reset();
    delay(5000);
  }

  //if you get here you have connected to the WiFi
  Serial.println("connected!");


  Serial.println("local ip");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/record", handleRecord);
  server.on("/command", handleCommand);
  server.on("/sensors", handleSensors);

  server.begin();

  //IR
  irrecv.enableIRIn(); // Start the receiver
  irsend.begin();

  
  //DHT
  dht.begin();

 digitalWrite(LED_BUILTIN, HIGH);


}

void decodeCommand(decode_results *results) {
  // Dumps out the decode_results structure.
  // Call this after IRrecv::decode()
  int count = results->rawlen;
  irRecord = "";
  for (int i = 1; i < count; i++) {
    irRecord += String((unsigned long) results->rawbuf[i]*USECPERTICK, DEC);
    irRecord += " ";
  }

  Serial.println(irRecord);

 
}

void recordCommand(){
  
    if (irrecv.decode(&results)) {
      digitalWrite(LED_BUILTIN, LOW);
      decodeCommand(&results);
      irrecv.resume(); // Receive the next value
      digitalWrite(LED_BUILTIN, HIGH);
  }
  delay(100);
}

void loop() {
  server.handleClient();
  recordCommand();
}
