const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');


const app = express()
const mysql = require('mysql');

const cors = require("cors");
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');

app.use(cors({ origin: "*" }));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const CryptoJS = require('crypto-js')

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'leoleo1@',
    database: 'gfp',
    schema: 'gfp'
});

con.connect(function (err) {

    con.on('error', function (err) {
        console.log("[mysql error]", err);
    });

    if (err) throw err;
    console.log("mi sono connesso!");
});

//###########################################################################################

app.post('/api/user/selezionaRicetteUtente', (req, res) => {

    try {

        var totaleRighe;
        var paginaSelezionata = req.body.pagina;

        con.query("SELECT COUNT(*) FROM GFP.RICETTE WHERE _id = " + req.body.id + ";", function (errore, tot) {
            if (errore) throw errore;
            totaleRighe = tot[0]['COUNT(*)'];

            if (totaleRighe > 0) {

        con.query("SELECT * FROM GFP.RICETTE WHERE _id = " + req.body.id + ";", function (err, resp) {

            if (err) throw err;

            if (resp.length > 0) {

                let ricette = [];
                for (key in resp) {
                    ricette.push(resp[key]);
                }

                res.status(200).json({ stato: 'ok', ricette, totaleRighe });
            } else {
                res.status(200).json({ stato: 'ko' });
            }

        });
    }
});
    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post('/api/user/inserisciRicetta', (req, res) => {

    try {

        var myobj = {

            _id : req.body._id,
            titolo : req.body.titolo,
            username : req.body.username,
            descrizione : req.body.descrizione,
            step : req.body.step,
            procedimento : req.body.procedimento,
            immagine : req.body.immagine

        };

        con.query("INSERT INTO GFP.RICETTE (_id, titolo, username, descrizione, step, procedimento, immagine) VALUES ('" + myobj._id + "', '" + myobj.titolo + "', '" + myobj.username + "', '" + myobj.descrizione + "', '" + myobj.step + "', '" + myobj.procedimento + "', '" + myobj.immagine + "');", function (err, resp) {

            if (err) {
                res.status(200).json({ stato: 'ko' });
            } else {
                res.status(200).json({ stato: 'ok' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post("/api/user/sendmail", (req, res) => {
    async function main() {
        // Async function enables allows handling of promises with await
        
          // First, define send settings by creating a new transporter: 
          let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
            port: 465, // Port for SMTP (usually 465)
            secure: true, // Usually true if connecting to port 465
            auth: {
              user: "portal.gluten.free@gmail.com", // Your email address
              pass: "23Fg34R53WoQ2", // Password (for gmail, your app password)
              // ⚠️ For better security, use environment variables set on the server for these values when deploying
            },
          });
          
          // Define and send message inside transporter.sendEmail() and await info about send from promise:
          let info = await transporter.sendMail({
            from: 'portal.gluten.free@gmail.com',
            to: "roberto.sanso@gmail.com",
            subject: "Testing, testing, 123",
            html: `
            <h1>Hello there</h1>
            <p>Isn't NodeMailer useful?</p>
            `,
          });
        
          console.log(info.messageId); // Random ID generated after successful send (optional)
        }
        
        main()
        .catch(err => console.log(err));
});
/*
Salve <utente>,

Grazie per esserti registrato a glutenfreeportal.it. Clicca il link per verificare la tua email:

https://dashboard.render.com/email-confirm/?token=Y_n5RnVzci1jZnNhZmg5bWJqc2hyOW5pdDhiMPWy1SMHuisryL6pBl_SEOhLGLm5bmIDCtPo67pTgjQt

Questo link è valido per le prossime 24 ore. Se non hai fatto tu la richiesta di registrazione a glutenfreeportal.it ignora questa email.

i nostri migliori saluti,

il Team di GlutenFreePortal
*/
//###########################################################################################

app.post('/api/user/login', (req, res) => {

    let tokenFromUI = "kiruzzella1@";
    let encrypted = req.body.password;

    let _key = CryptoJS.enc.Utf8.parse(tokenFromUI);
    let _iv = CryptoJS.enc.Utf8.parse(tokenFromUI);

    let decrypted = JSON.parse(CryptoJS.AES.decrypt(
        encrypted, _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8));

    try {

        con.query("SELECT * FROM GFP.USER WHERE username='" + req.body.username + "' AND  password='" + decrypted + "';", function (err, resp) {

            if (err) throw err;

            if (resp.length === 1) {

                let userRisultato = [];

                for (key of resp) {
                    userRisultato.push(resp[0]);
                }

                if (userRisultato[0].cancellato == 1) {
                    res.status(200).json({ stato: 'ko' });
                } else if (userRisultato[0].attivo == 0) {
                    res.status(200).json({ stato: 'pending' });
                } else {
                    res.status(200).json({ stato: 'ok', resp });
                }

            } else {
                res.status(200).json({ stato: 'ko' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
});

//###########################################################################################

app.post('/api/user/inserisci', (req, res) => {

    try {

        let tokenFromUI = "kiruzzella1@";
        let encrypted = req.body.password;

        let _key = CryptoJS.enc.Utf8.parse(tokenFromUI);
        let _iv = CryptoJS.enc.Utf8.parse(tokenFromUI);

        let decrypted = JSON.parse(CryptoJS.AES.decrypt(
            encrypted, _key, {
            keySize: 16,
            iv: _iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8));

        var myobj = {
            name: req.body.name,
            username: req.body.username,
            password: decrypted,
            mail: req.body.mail,
            level: req.body.level,
            attivo: req.body.attivo,
            cancellato: req.body.cancellato,
            token: req.body.token
        };

        con.query("INSERT INTO GFP.USER (name, username, password, mail, level, attivo, cancellato, token) VALUES ('" + myobj.name + "', '" + myobj.username + "', '" + myobj.password + "', '" + myobj.mail + "', '" + myobj.level + "', " + myobj.attivo + ", " + myobj.cancellato + ", '" + myobj.token + "');", function (err, resp) {

            if (err) {
                res.status(200).json({ stato: 'ko' });
            } else {
                res.status(200).json({ stato: 'ok' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post('/api/user/selezionaUtenti', (req, res) => {

    try {
        var totaleRighe;
        var paginaSelezionata = req.body.pagina;

        con.query("SELECT COUNT(*) FROM GFP.USER;", function (errore, tot) {
            if (errore) throw errore;
            totaleRighe = tot[0]['COUNT(*)'];

            if (totaleRighe > 0) {

                con.query("SELECT * FROM GFP.USER LIMIT " + paginaSelezionata + ", 10;", function (err, resp) {

                    if (err) throw err;

                    if (resp.length > 0) {

                        let users = [];
                        for (key in resp) {
                            users.push(resp[key]);
                        }

                        res.status(200).json({ stato: 'ok', users, totaleRighe });
                    } else {
                        res.status(200).json({ stato: 'ko' });
                    }


                });

            }


        });



    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post('/api/user/selezionaPerModifica', (req, res) => {

    try {

        con.query("SELECT * FROM GFP.USER WHERE _id = " + req.body._id + ";", function (err, resp) {

            if (err) throw err;

            if (resp.length > 0) {
                res.status(200).json({ stato: 'ok', resp });
            } else {
                res.status(200).json({ stato: 'ko' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post('/api/user/selezionaByUsername', (req, res) => {

    try {

        con.query("SELECT * FROM GFP.USER WHERE username = '" + req.body.username + "';", function (err, resp) {

            if (err) throw err;

            if (resp.length > 0) {
                res.status(200).json({ stato: 'ok' });
            } else {
                res.status(200).json({ stato: 'ko' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post('/api/user/selezionaByUsernameInEdit', (req, res) => {

    try {
        console.log("SELECT * FROM GFP.USER WHERE username = '" + req.body.username + "' AND _id != '" + req.body._id + "';");
        con.query("SELECT * FROM GFP.USER WHERE username = '" + req.body.username + "' AND _id != '" + req.body._id + "';", function (err, resp) {

            if (err) throw err;

            if (resp.length > 0) {
                res.status(200).json({ stato: 'ok' });
            } else {
                res.status(200).json({ stato: 'ko' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post('/api/user/cancella', (req, res) => {

    try {

        con.query("UPDATE GFP.USER SET cancellato = 1 WHERE _id = '" + req.body._id + "';", function (err, resp) {

            if (err) {
                res.status(200).json({ stato: 'ko' });
            } else {
                res.status(200).json({ stato: 'ok' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

app.post('/api/user/modifica', (req, res) => {

    try {

        let tokenFromUI = "kiruzzella1@";
        let encrypted = req.body.password;

        let _key = CryptoJS.enc.Utf8.parse(tokenFromUI);
        let _iv = CryptoJS.enc.Utf8.parse(tokenFromUI);

        let decrypted = JSON.parse(CryptoJS.AES.decrypt(
            encrypted, _key, {
            keySize: 16,
            iv: _iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8));

        con.query("UPDATE GFP.USER SET name = '" + req.body.name + "', username = '" + req.body.username + "', password = '" + decrypted + "', mail = '" + req.body.mail + "', level = '" + req.body.level + "', attivo = " + req.body.attivo + " WHERE _id = '" + req.body._id + "';", function (err, resp) {

            if (err) {
                res.status(200).json({ stato: 'ko' });
            } else {
                res.status(200).json({ stato: 'ok' });
            }

        });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }

});

//###########################################################################################

module.exports = router;

app.listen(3000, () => console.log('il server sta su e lo trovi sulla porta 3000!'))
