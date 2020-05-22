const prompt = require('prompt-sync')();
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const SteamUser = require('steam-user');
const cheerio = require('cheerio');
module.exports = class autoClean{
    constructor(data){
        this.data = data?data:{};
        this.community = new SteamCommunity();
        this.client = new SteamUser();
        this.data.account = this.data.account?this.data.account:prompt('Enter your account: ');
        this.data.password = this.data.password?this.data.password:prompt('Enter your password: ',{echo:'*'});
        this.data.shared_secret = this.data.shared_secret?SteamTotp.generateAuthCode(this.data.shared_secret):prompt('Enter your auth code: ');

        let logData = {
            accountName : this.data.account,
            password : this.data.password,
            twoFactorCode : this.data.shared_secret
        };

        this.client.on('loggedOn', () => {
            console.info(`[${this.data.account}]: Bot logged into steam`);
            this.client.setPersona(SteamUser.EPersonaState.Online);
        });
        this.client.on('webSession', (sessionid, cookies) => {
            this.community.setCookies(cookies);
            this.community.startConfirmationChecker(10000, this.data.shared_secret);
            this.clean();
        });
        this.client.logOn(logData);    
    }
    clean(){
        console.info(`[${this.data.account}]: Start cleaning`);
        this.community.request.post({url:'https://store.steampowered.com/springcleaning/ajaxoptintoevent',form:{'sessionid':this.community.getSessionID()}},(err,res,body)=>{
            if(err){
                console.error(`[${this.data.account}]`,err.message);
                return;
            }
            if(!body){
                console.error(`[${this.data.account}]`,res.statusCode);
                return;
            }
            this.community.request.get({url:'https://store.steampowered.com/springcleaning'},(err,res,body)=>{
                if(err){
                    console.error(`[${this.data.account}]`,err.message);
                    return;
                }
                if(!body){
                    console.error(`[${this.data.account}]`,res.statusCode);
                    return;
                }
                const $ = cheerio.load(body);
                const games = [];
                $('a[class=btn_playnow]').each((index,element)=>{
                    let row = $(element).attr('href');
                    games.push(parseInt(row.substr(12),10));
                });
                this.client.gamesPlayed(games);
            });
            
        }); 
    }
    
}