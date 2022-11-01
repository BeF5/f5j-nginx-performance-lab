let fs = require("fs");

function getFileList(path, regstr) {
  let regex = new RegExp(regstr);
  let files = fs.readdirSync(path);
  let result = files.filter(e => regex.test(e))
  return result 
}

function getTableItems(r) {

  if ( r.variables.filepath == undefined || 
       r.variables.regstr == undefined ) {
    ngx.log(ngx.ERR, "Variables Error. filepath:"+r.variables.filepath+" regstr:"+r.variables.regstr);
    r.return(502);
    return;
  }

  // Table can show thease items 
  let tableHead = [ "createdAt", "protocol", "targetHost", "senario" ]

  let tableItems = [];

  let htmlFiles = getFileList(r.variables.filepath, r.variables.regstr);

  htmlFiles.forEach( (f,fi) => {
    let obj = {};
    let idx;
    obj.id = fi+1;
    obj.file = f
    f.split("_").forEach( (e,ei) => {
      tableHead.length <= ei ? idx = ei : idx = tableHead[ei];
      obj[idx]=e;
    })
    tableItems.push(obj)
  })

  r.return(200, JSON.stringify(tableItems));
}

export default { getTableItems }
