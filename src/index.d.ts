export interface ConfigData{
    value?:string ;            //value of information
    name?:string;                // name of item
    key?:string;                // element selector
    attr?:string;               // attribute to get value
                                // if attr==null or underfind => value=element.textConte
    prefix?:string;             // first string to get infor
    subfix?:string;             // last string get get infor, use when infor mix with other infor
    ignore?:string|RegExp;      // ignore string/regexp 
}