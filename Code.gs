
class LinebotService{
  constructor(){
    const scriptProperties = PropertiesService.getScriptProperties();
    this.IMGFOLDER_ID = scriptProperties.getProperty('IMGFOLDER_ID');
    this.CSVFILE_ID = scriptProperties.getProperty('CSVFILE_ID');
    this.SheetName = 'ENV_DATA';
    this.TempColum = '2';
    this.HumidColum = '3';
    this.GetDateColum = '4';

    this.ACCESS_TOKEN = scriptProperties.getProperty('LINE_ACCESS_TOKEN');
    this.USER_ID = scriptProperties.getProperty('LINE_USER_ID');
    this.BROAD_URL = "https://api.line.me/v2/bot/message/broadcast";
    this.PUSH_URL = "https://api.line.me/v2/bot/message/push";
    this.TXT = 'text';
    this.IMG = 'image';

    this.mainProcess();

  }
  
  mainProcess() {

    var imgUrl = this.getIMGURL();
    var txt = this.getText();
    var txt2 = this.getCSVData();

    // アップロード日が現在の日付と同じであるかを確認
    if ( imgUrl != null ) {
      // message送信
      this.sendMessageToLine(txt, imgUrl);
    }
  }

  getIMGURL(){
    var folder = DriveApp.getFolderById(this.IMGFOLDER_ID);
    var files = folder.getFiles();

    //取得した１件だけ送信する
    var file = files.next();
    var dateCreated = file.getDateCreated();
    var currentDate = new Date();
    if ( dateCreated.toDateString() === currentDate.toDateString() ) {
      return file.getDownloadUrl();
    }
  }

  getText(){
  var currentDate = new Date();
  return currentDate.toDateString() + "の画像です。"
  }

  getCSVData(){
    //ほんとは取得日が本日かどうかを確認する必要有
    var ss = SpreadsheetApp.openById(this.CSVFILE_ID);
    var sheet = ss.getSheetByName(this.SheetName); 
    var row = sheet.getLastRow();
    var temp = sheet.getRange(row,this.TempColum).getValue();
    var humid = sheet.getRange(row,this.HumidColum).getValue();
    var getDate = sheet.getRange(row,this.GetDateColum).getValue();
    return "日付: "+getDate+"\n温度: "+temp+"℃ \n湿度: "+humid+"%";
  }

  sendMessageToLine(msg_txt, msg_img) {

    var headers = {
      "Content-Type" : "application/json; charset=UTF-8",
      'Authorization': 'Bearer ' + this.ACCESS_TOKEN,
    };

    var postData = {
      //"to": USER_ID, // for debug
      "messages": [{
        "type": this.TXT,
        "text": msg_txt,
      },
      {
        "type": this.IMG,
        "originalContentUrl": msg_img,
        "previewImageUrl": msg_img
      }]
    };

    var options = {
      "method" : "post",
      "headers" : headers,
      "payload" : JSON.stringify(postData)
    };

    return UrlFetchApp.fetch(this.BROAD_URL, options);
  }

}

function sendMessage(){
  new LinebotService();
}
