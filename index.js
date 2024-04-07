const express = require("express")
const mysql=require("mysql")
const conn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"timetabel"
})
if(conn){
    console.log("data base is connected")
}
const cors=require('cors')
const app=express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.post('/', (req, res) => {
    const { lusername,lpassword } = req.body;
    const d=conn.query("select * from usersdata where username=? and password=?",[lusername,lpassword],(err,data)=>{
        if(data.length>0){
            const s=data[0].admin
            console.log(s);
            res.json(`login successfully ${s}`)
        }
        else{
            res.json("login faied")
        }
    });
    
    }
);
app.post('/signup',(req,res)=>{
    const {susername,sbranch,sphone,spassword}=req.body;
    conn.query("insert into usersdata values(?,?,?,?,?)",[susername,spassword,sbranch,sphone,0])
    res.json("signup is successfull")
})
app.post('/data', (req, res) => {
  const { name, branch } = req.body;
  let yr = [];
  let promises = [];

  for (let i = 1; i < 9; i++) {
    let promise = new Promise((resolve, reject) => {
      conn.query("select * from ?st where faculty=? and branch=?", [i, name, branch], (err, data) => {
        if (err) {
          reject(err);
        } else {
          data.forEach(element => {
            let js = {
              "periodname": element.periodname,
              "faculty": element.faculty,
              "year": element.year,
              "branch": element.branch,
              "section": element.section,
              "day": element.day,
              "period": i
            };
            yr.push(js);
          });
          resolve();
        }
      });
    });
    promises.push(promise);
  }

  Promise.all(promises).then(() => {
    res.json(yr);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('An error occurred');
  });
});

app.post('/assign', async (req, res) => {
  const { abranch, ayear, asection } = req.body;
  let yr = [];
  const promises = [];
  for (let i = 1; i < 9; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        conn.query("SELECT * FROM ?st WHERE branch=? AND year=? AND section=?", [i, abranch, ayear, asection], (err, data) => {
          if (err) {
            reject(err);
          } else {
            data.forEach(element => {
              let js = {
                "periodname": element.periodname,
                "faculty": element.faculty,
                "year": ayear,
                "branch": abranch,
                "section": asection,
                "day":element.day,
                "period":i
              };
              yr.push(js);
            });
            resolve();
          }
        });
      })
    );
  }
  try {
    await Promise.all(promises);
    res.json(yr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/test1',(req,res)=>{
const {abranch}=req.body;
    conn.query("select * from usersdata where branch=?",[abranch],(err,data)=>{
        var e=[]
        data.forEach(element => {
            e.push(element.username)
        });
        res.json(e)
    })
})
app.post('/insert',(req,res)=>{
    const {y}=req.body;
    const data=JSON.parse(y)
    var c=conn.query("insert into ?st values(?,?,?,?,?,?)",[parseInt(data.time[0]),data.subject,data.faculty,data.branch,data.day,data.section,data.year])
    if(c){
    res.json("inserted data")
    }
    else{
        res.json("cannot insert please contact admin")
    }
    //console.log(typeof(parseInt(data.time[0])))
})
app.post('/editget',async (req,res)=>{
  const {branch,year,section,timing}=req.body
  let yr = [];
  const promises = [];
  for (let i = 1; i < 9; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        conn.query("SELECT * FROM ?st WHERE branch=? AND year=? AND section=?", [i, branch, year, section], (err, data) => {
          if (err) {
            reject(err);
          } else {
            data.forEach(element => {
              let js = {
                "periodname": element.periodname
              };
              yr.push(js);
            });
            resolve();
          }
        });
      })
    );
  }
  try {
    await Promise.all(promises);
    res.json(yr);
    console.log(yr)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})
app.post('/edit',(req,res)=>{
  const {branch,year,section,timing,day,sub,t}=req.body
  const rt=conn.query("update ?st set periodname=? , faculty=? where branch=? and section=? and year=? and day=?;",[parseInt(timing),sub,t,branch,section,year,day])
  if(rt){
    console.log(t)
    res.json("done")
  }
  else{
    res.json("failed")
  }
})
app.listen(6500,()=>{
    console.log("Server is running at 6500")
})
