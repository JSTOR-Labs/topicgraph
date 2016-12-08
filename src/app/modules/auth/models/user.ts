export class User {

    public userid: string;
    public password: string;
    public keepLoggedIn : boolean = true;
    public email: string;
    public username: string;
    public firstName: string;
    public lastName: string;
    public labsAdmin : boolean = false;
    public labsGroups : string[] = [];

}
