
function doTestFetch(){
  chrome.runtime.sendMessage(
      {
          contentScriptQuery: 'queryPrice',
          itemId: 12345
      },
      price => {
          console.error({price});
      }
  );
}

window.addEventListener('load', function() {
console.log('load');
//Global Data for checking
//window.QMObserver
window.QMObserver = {}

let nmin = 0,
    nsec = 0,
    nhour = 0,
    isPaused = false,
    refreshIntervalId = "",
    alarmTimerID = "",
    dataChips = [],
    targetingChips = [],
    countryTimeout = null,
    notificationsLS = !localStorage.notifications ?
    localStorage.setItem("notifications", JSON.stringify({
        "seen": false,
    })) :
    console.log('Notifications set'),
    settings = !localStorage.settings ?
    localStorage.setItem("settings", JSON.stringify({
        "dark_mode": false,
        "bls_mode": false,
        "change_position": false,
        "show_temper": false,
        "show_MV": false,
        "show_NI": false,
        "case_reminder": false,
        "consult_monitoring": false
        
    })) :
    console.log('Settings set');

window.document.onkeydown = (e) => {
    if (e.altKey && e.keyCode == 192){
        
        e.preventDefault();
        document.querySelector('#trackerUL').classList.toggle("scale-in");
        document.querySelector('.fixed-action-btn').classList.toggle("active");
        console.log(e);
    } else if (e.altKey && e.which == 81) {
        e.preventDefault();
        toggleCards();
    } else if (e.altKey && e.which == 69){
        e.preventDefault();
        doNeedsInfo();
    } else if(e.altKey && e.which == 83){
        // open scraper
        $('#MVModal').modal('open');
    } else if(e.altKey && e.which == 87){
        // open QM scraper
        $('#QMModal').modal('open');
    } else if(e.altKey && e.which == 65){
        // open scraper
        $('#nimodal').modal('open');
        getConsultedBucket();
    }
}


let QMData = {};

let data={countrySelectOptions:[{name:"Afghanistan"},{name:"Ã…land Islands"},{name:"Albania"},{name:"Algeria"},{name:"American Samoa"},{name:"Andorra"},{name:"Angola"},{name:"Anguilla"},{name:"Antarctica"},{name:"Antigua and Barbuda"},{name:"Argentina"},{name:"Armenia"},{name:"Aruba"},{name:"Australia"},{name:"Austria"},{name:"Azerbaijan"},{name:"Bahamas"},{name:"Bahrain"},{name:"Bangladesh"},{name:"Barbados"},{name:"Belarus"},{name:"Belgium"},{name:"Belize"},{name:"Benin"},{name:"Bermuda"},{name:"Bhutan"},{name:"Bolivia"},{name:"Bosnia and Herzegovina"},{name:"Botswana"},{name:"Bouvet Island"},{name:"Brazil"},{name:"British Indian Ocean Territory"},{name:"Brunei Darussalam"},{name:"Bulgaria"},{name:"Burkina Faso"},{name:"Burundi"},{name:"Cambodia"},{name:"Cameroon"},{name:"Canada"},{name:"Cape Verde"},{name:"Cayman Islands"},{name:"Central African Republic"},{name:"Chad"},{name:"Chile"},{name:"China"},{name:"Christmas Island"},{name:"Cocos (Keeling) Islands"},{name:"Colombia"},{name:"Comoros"},{name:"Congo"},{name:"Congo"},{name:"The Democratic Republic of The Cook Islands"},{name:"Costa Rica"},{name:"Cote D'ivoire"},{name:"Croatia"},{name:"Cuba"},{name:"Cyprus"},{name:"Czech Republic"},{name:"Denmark"},{name:"Djibouti"},{name:"Dominica"},{name:"Dominican Republic"},{name:"Ecuador"},{name:"Egypt"},{name:"El Salvador"},{name:"Equatorial Guinea"},{name:"Eritrea"},{name:"Estonia"},{name:"Ethiopia"},{name:"Falkland Islands (Malvinas)"},{name:"Faroe Islands"},{name:"Fiji"},{name:"Finland"},{name:"France"},{name:"French Guiana"},{name:"French Polynesia"},{name:"French Southern Territories"},{name:"Gabon"},{name:"Gambia"},{name:"Georgia"},{name:"Germany"},{name:"Ghana"},{name:"Gibraltar"},{name:"Greece"},{name:"Greenland"},{name:"Grenada"},{name:"Guadeloupe"},{name:"Guam"},{name:"Guatemala"},{name:"Guernsey"},{name:"Guinea"},{name:"Guinea-bissau"},{name:"Guyana"},{name:"Haiti"},{name:"Heard Island and Mcdonald Islands"},{name:"Holy See (Vatican City State)"},{name:"Honduras"},{name:"Hong Kong"},{name:"Hungary"},{name:"Iceland"},{name:"India"},{name:"Indonesia"},{name:"Iran"},{name:"Iraq"},{name:"Ireland"},{name:"Isle of Man"},{name:"Israel"},{name:"Italy"},{name:"Jamaica"},{name:"Japan"},{name:"Jersey"},{name:"Jordan"},{name:"Kazakhstan"},{name:"Kenya"},{name:"Kiribati"},{name:"Korea"},{name:"Democratic People's Republic of Korea"},{name:"Republic of Kuwait"},{name:"Kyrgyzstan"},{name:"Lao People's Democratic Republic"},{name:"Latvia"},{name:"Lebanon"},{name:"Lesotho"},{name:"Liberia"},{name:"Libyan Arab Jamahiriya"},{name:"Liechtenstein"},{name:"Lithuania"},{name:"Luxembourg"},{name:"Macao"},{name:"Macedonia"},{name:"The Former Yugoslav Republic of Madagascar"},{name:"Malawi"},{name:"Malaysia"},{name:"Maldives"},{name:"Mali"},{name:"Malta"},{name:"Marshall Islands"},{name:"Martinique"},{name:"Mauritania"},{name:"Mauritius"},{name:"Mayotte"},{name:"Mexico"},{name:"Federated States of Micronesia"},{name:"Moldova"},{name:"Monaco"},{name:"Mongolia"},{name:"Montenegro"},{name:"Montserrat"},{name:"Morocco"},{name:"Mozambique"},{name:"Myanmar"},{name:"Namibia"},{name:"Nauru"},{name:"Nepal"},{name:"Netherlands"},{name:"Netherlands Antilles"},{name:"New Caledonia"},{name:"New Zealand"},{name:"Nicaragua"},{name:"Niger"},{name:"Nigeria"},{name:"Niue"},{name:"Norfolk Island"},{name:"Northern Mariana Islands"},{name:"Norway"},{name:"Oman"},{name:"Pakistan"},{name:"Palau"},{name:"Palestinian Territory Occupied"},{name:"Panama"},{name:"Papua New Guinea"},{name:"Paraguay"},{name:"Peru"},{name:"Philippines"},{name:"Pitcairn"},{name:"Poland"},{name:"Portugal"},{name:"Puerto Rico"},{name:"Qatar"},{name:"Reunion"},{name:"Romania"},{name:"Russia"},{name:"Rwanda"},{name:"Saint Helena"},{name:"Saint Kitts and Nevis"},{name:"Saint Lucia"},{name:"Saint Pierre and Miquelon"},{name:"Saint Vincent and The Grenadines"},{name:"Samoa"},{name:"San Marino"},{name:"Sao Tome and Principe"},{name:"Saudi Arabia"},{name:"Senegal"},{name:"Serbia"},{name:"Seychelles"},{name:"Sierra Leone"},{name:"Singapore"},{name:"Slovakia"},{name:"Slovenia"},{name:"Solomon Islands"},{name:"Somalia"},{name:"South Africa"},{name:"South Georgia and The South Sandwich Islands"},{name:"Spain"},{name:"Sri Lanka"},{name:"Sudan"},{name:"Suriname"},{name:"Svalbard and Jan Mayen"},{name:"Swaziland"},{name:"Sweden"},{name:"Switzerland"},{name:"Syrian Arab Republic"},{name:"Taiwan"},{name:"China"},{name:"Tajikistan"},{name:"Tanzania"},{name:"Thailand"},{name:"Timor-leste"},{name:"Togo"},{name:"Tokelau"},{name:"Tonga"},{name:"Trinidad and Tobago"},{name:"Tunisia"},{name:"Turkey"},{name:"Turkmenistan"},{name:"Turks and Caicos Islands"},{name:"Tuvalu"},{name:"Uganda"},{name:"Ukraine"},{name:"United Arab Emirates"},{name:"United Kingdom"},{name:"United States"},{name:"United States Minor Outlying Islands"},{name:"Uruguay"},{name:"Uzbekistan"},{name:"Vanuatu"},{name:"Venezuela"},{name:"Viet Nam"},{name:"Virgin Islands British"},{name:"Virgin Islands U.S."},{name:"Wallis and Futuna"},{name:"Western Sahara"},{name:"Yemen"},{name:"Zambia"},{name:"Zimbabwe"}],languageSelectOptions:[{name:"Afrikaans (af)",langCode:"af"},{name:"Albanian (sq)",langCode:"sq"},{name:"Amharic (am)",langCode:"am"},{name:"Arabic (ar)",langCode:"ar"},{name:"Arabic (Egypt) (ar-EG)",langCode:"ar-EG"},{name:"Armenian (hy)",langCode:"hy"},{name:"Azerbaijani (az)",langCode:"az"},{name:"Basque (eu)",langCode:"eu"},{name:"Belarusian (be)",langCode:"be"},{name:"Bengali (bn)",langCode:"bn"},{name:"Bosnian (bs)",langCode:"bs"},{name:"Bulgarian (bg)",langCode:"bg"},{name:"Burmese (Myanmar) (my)",langCode:"my"},{name:"Catalan (ca)",langCode:"ca"},{name:"Chinese (Hong Kong) (zh-HK)",langCode:"zh-HK"},{name:"Chinese (Malay) (zh-MS)",langCode:"zh-MS"},{name:"Chinese (Simplified) (zh-Hans)",langCode:"zh-Hans"},{name:"Chinese (Singapore) (zh-SG)",langCode:"zh-SG"},{name:"Chinese (Traditional) (zh-Hant)",langCode:"zh-Hant"},{name:"Croatian (hr)",langCode:"hr"},{name:"Czech (cs)",langCode:"cs"},{name:"Danish (da)",langCode:"da"},{name:"Dutch (nl)",langCode:"nl"},{name:"Dutch (Belgium) (nl-BL)",langCode:"nl-BL"},{name:"English (en)",langCode:"en"},{name:"English (Australia) (en-AU)",langCode:"en-AU"},{name:"English (Belgium) (en-BL)",langCode:"en-BL"},{name:"English (Canada) (en-CA)",langCode:"en-CA"},{name:"English (Hong Kong) (en-HK)",langCode:"en-HK"},{name:"English (India) (en-IN)",langCode:"en-IN"},{name:"English (Ireland) (en-IE)",langCode:"en-IE"},{name:"English (Malaysia) (en-MY)",langCode:"en-MY"},{name:"English (New Zealand) (en-NZ)",langCode:"en-NZ"},{name:"English (Singapore) (en-SG)",langCode:"en-SG"},{name:"English (South Africa) (en-ZA)",langCode:"en-ZA"},{name:"English (Switzerland) (en-CH)",langCode:"en-CH"},{name:"English (UK) (en-GB)",langCode:"en-GB"},{name:"Estonian (et)",langCode:"et"},{name:"Farsi (fa)",langCode:"fa"},{name:"Filipino (fil)",langCode:"fil"},{name:"Finnish (fi)",langCode:"fi"},{name:"French (fr)",langCode:"fr"},{name:"French (Belgium) (fr-BL)",langCode:"fr-BL"},{name:"French (Canada) (fr-CA)",langCode:"fr-CA"},{name:"French (Luxembourg) (fr-LU)",langCode:"fr-LU"},{name:"French (Switzerland) (fr-CH)",langCode:"fr-CH"},{name:"Galician (gl)",langCode:"gl"},{name:"Georgian (ka)",langCode:"ka"},{name:"German (de)",langCode:"de"},{name:"German (Austria) (de-AT)",langCode:"de-AT"},{name:"German (Belgium) (de-BL)",langCode:"de-BL"},{name:"German (Luxembourg) (de-LU)",langCode:"de-LU"},{name:"German (Switzerland) (de-CH)",langCode:"de-CH"},{name:"Greek (el)",langCode:"el"},{name:"Gujarati (gu)",langCode:"gu"},{name:"Hebrew (iw)",langCode:"iw"},{name:"Hindi (hi)",langCode:"hi"},{name:"Hungarian (hu)",langCode:"hu"},{name:"Icelandic (is)",langCode:"is"},{name:"Indonesian (id)",langCode:"id"},{name:"Irish (ga)",langCode:"ga"},{name:"Italian (it)",langCode:"it"},{name:"Italian (Switzerland) (it-CH)",langCode:"it-CH"},{name:"Japanese (ja)",langCode:"ja"},{name:"Kannada (kn)",langCode:"kn"},{name:"Kazakh (kk)",langCode:"kk"},{name:"Khmer (km)",langCode:"km"},{name:"Kinyarwanda (rw)",langCode:"rw"},{name:"Korean (ko)",langCode:"ko"},{name:"Kyrgyz (ky)",langCode:"ky"},{name:"Lao (lo)",langCode:"lo"},{name:"Latin (la)",langCode:"la"},{name:"Latvian (lv)",langCode:"lv"},{name:"Lithuanian (lt)",langCode:"lt"},{name:"Luganda (lg)",langCode:"lg"},{name:"Macedonian (mk)",langCode:"mk"},{name:"Malagasy (mg)",langCode:"mg"},{name:"Malay (ms)",langCode:"ms"},{name:"Malayalam (ml)",langCode:"ml"},{name:"Maltese (mt)",langCode:"mt"},{name:"Marathi (mr)",langCode:"mr"},{name:"Mauritian Creole (crp)",langCode:"crp"},{name:"Mongolian (mn)",langCode:"mn"},{name:"Nepali (ne)",langCode:"ne"},{name:"Norwegian (no)",langCode:"no"},{name:"Norwegian (DO NOT USE) (nb)",langCode:"nb"},{name:"Norwegian (Nynorsk) (nn)",langCode:"nn"},{name:"Oriya (or)",langCode:"or"},{name:"Polish (pl)",langCode:"pl"},{name:"Portuguese (pt)",langCode:"pt"},{name:"Portuguese (Brazil) (pt-BR)",langCode:"pt-BR"},{name:"Punjabi (pa)",langCode:"pa"},{name:"Rhaeto-Romance (rm)",langCode:"rm"},{name:"Romanian (ro)",langCode:"ro"},{name:"Russian (ru)",langCode:"ru"},{name:"Russian (Azerbaijan) (ru-AZ)",langCode:"ru-AZ"},{name:"Russian (Belarus) (ru-BY)",langCode:"ru-BY"},{name:"Russian (Kazakhstan) (ru-KZ)",langCode:"ru-KZ"},{name:"Russian (Ukraine) (ru-UA)",langCode:"ru-UA"},{name:"Serbian (sr)",langCode:"sr"},{name:"Sinhala (si)",langCode:"si"},{name:"Slovak (sk)",langCode:"sk"},{name:"Slovenian (sl)",langCode:"sl"},{name:"Spanish (es)",langCode:"es"},{name:"Spanish (Latin America) (es-419)",langCode:"es-419"},{name:"Swahili (sw)",langCode:"sw"},{name:"Swedish (sv)",langCode:"sv"},{name:"Tamil (ta)",langCode:"ta"},{name:"Telugu (te)",langCode:"te"},{name:"Thai (th)",langCode:"th"},{name:"Turkish (tr)",langCode:"tr"},{name:"Ukrainian (uk)",langCode:"uk"},{name:"Urdu (ur)",langCode:"ur"},{name:"Uzbek (uz)",langCode:"uz"},{name:"Vietnamese (vi)",langCode:"vi"},{name:"Welsh (cy)",langCode:"cy"},{name:"Yiddish (yi)",langCode:"yi"},{name:"Yoruba (yo)",langCode:"yo"},{name:"Zulu (zu)",langCode:"zu"}],SRCategories:[{name:"Review-SurveyStarted"},{name:"Review-NeedsInfo"},{name:"Review-Consult"},{name:"Review-Non-EN"},{name:"Review-HealthMedical"},{name:"Review-Swiss"},{name:"Review-Policypoll"},{name:"Review-IntRecurring"},{name:"Review-IntResponses"},{name:"Review-Targeting"},{name:"Review-Enterprise-Invoice"},{name:"Review-Enterprise-SharedBalance"},{name:"Review-OutsideEWOQ"},{name:"Review-Nonsensical"},{name:"TRN"},{name:"SurveyDeleted"},{name:"Support-RefundCoupon"},{name:"Review-Split"},{name:"Overpaid"},{name:"Review-Language"},{name:"Review-R&CGeneral"},{name:"Review-SexStarted"},{name:"Review-Financial"},{name:"Review-HealthStarted"},{name:"Review-PoliticalStarted"},{name:"Review-TechStarted"},{name:"Review-AlcoholStarted"},{name:"Review-GamblingStarted"},{name:"Review-TradeUnion"},{name:"Review-OtherForbidden"},{name:"Review-MachineTranslation"},{name:"Review-IncorrectTargeting"},{name:"Review-AdultContent"},{name:"Review-Capitalization"},{name:"Review-ElectionPolling"},{name:"Review-General:Clarity"},{name:"Review-General:DoNotAnswer"},{name:"Review-General:FalseInformation"},{name:"Review-General:GimmickySymbols"},{name:"Review-General:IncorrectQuestionFeature"},{name:"Review-General:AnswerDuplicate/Overlap"},{name:"Review-General:Pre-Screener"},{name:"Review-Health:Vivid"},{name:"Review-Health:OtherNon-Starter"},{name:"Review-Health:GOROnly"},{name:"Review-ImageUnclear"},{name:"Review-InappropriateLanguage"},{name:"Review-LanguageMismatch"},{name:"Review-QuestionShouldScreen"},{name:"Review-ModifyScreeningQuestion"},{name:"Review-MultipleQuestions"},{name:"Review-NeedsPermissionScreen"},{name:"Review-NOTA:AgeQuestions"},{name:"Review-NotaMissing"},{name:"Review-Offensive:Death"},{name:"Review-Offensive:GeneralLiking"},{name:"Review-Offensive:Guns"},{name:"Review-Offensive:Other"},{name:"Review-Offensive:Violence"},{name:"Review-Offensive:Wars"},{name:"Review-OpenEndedNumeric"},{name:"Review-OpenEndedSingleLetter"},{name:"Review-PartialPin(AnswerNotPinned)"},{name:"Review-PII"},{name:"Review-PipingPlaceholderFormat"},{name:"Review-PolicyPolling:NeedsOptOut"},{name:"Review-PolicyPolling:Phrasing"},{name:"Review-PushPolling:Influence"},{name:"Review-PushPolling:CallToAction"},{name:"Review-PushPolling:Ad"},{name:"Review-QuestionType:Multi Answer"},{name:"Review-QuestionType:SingleAnswer"},{name:"Review-RangesMismatch"},{name:"Review-SensitiveDemo(Age/Gender/Race)"},{name:"Review-SensitiveDemo(Religion/Immigration/Sex):GOR"},{name:"Review-SensitiveDemo(Religion/Immigration/Sex):NeedsOptOut"},{name:"Review-SensitiveSubjects:GOROnly"},{name:"Review-SensitiveSubjects:Non-Starter"},{name:"Review-SensitiveSubjects:NeedsOptOut"},{name:"Review-Spelling"},{name:"Review-Video:Length"},{name:"Review-Video:Multiple"},{name:"Review-Video:Private"}],supportCategories:[{name:"Support-NoActionNeeded"},{name:"Support-CreationWarm"},{name:"Support-BLSPushBack"},{name:"Support-RMK"},{name:"Support-Zip"},{name:"Support-AccountCreation"},{name:"Support-AddOwner"},{name:"Support-Adwords"},{name:"Support-BuyResponses"},{name:"Support-Creation"},{name:"Support-Contact"},{name:"Support-DSCannotViewDownload"},{name:"Support-DSShareResult"},{name:"Support-DSDataDiscrepancy"},{name:"Support-DSFeaturesNotWorking"},{name:"Support-DSCombineResults"},{name:"Support-DSInterpretResult"},{name:"Support-DSHCTutorial"},{name:"Support-DSGoogleAnalytics"},{name:"Support-DSOther"},{name:"Support-Flagged/Enterprise"},{name:"Support-Flagged/Internal"},{name:"Support-Flagged/Restarted"},{name:"Support-Flagged/Stopped"},{name:"Support-General"},{name:"Support-IncTest"},{name:"Support-IncToolBug"},{name:"Support-Methodology"},{name:"Support-NeedsMod"},{name:"Support-NoQ"},{name:"Support-Pause/Stop"},{name:"Support-Payment/Billing"},{name:"Support-Policy"},{name:"Support-Pricing"},{name:"Support-ProductFeedback"},{name:"Support-RefundCoupon"},{name:"Support-Reporting/Analysis"},{name:"Support-Spam"},{name:"Support-Targeting"},{name:"Support-TrackingSubscriptions"},{name:"Support-UserFeedback(not GOR)"},{name:"Support-Websat"},{name:"Support-WhitelistSupport"},{name:"Support-Googler"},{name:"Support-Enterprise-Invoice"},{name:"Support-Enterprise-SharedBalance"},{name:"Support-AccountLinking"},{name:"Support-Surveys360Client"},{name:"Support-CustomSalesLeads"},{name:"Support-NeedsInfo"},{name:"Support-Consult"},{name:"Support-OpinionRewards"},{name:"Support-Chat"},{name:"Support-360Reseller"},{name:"Support-Deleted"},{name:"Support-Inbound"},{name:"Support-Followup"},{name:"Support-Feedback"},{name:"Support-SameIssue"},{name:"Support-Deleted"},{name:"Support-NonEn"},{name:"Support-NonGCS"},{name:"Support-NeedsAttention"},{name:"Support-AccountManagement"},{name:"Support-SlowCollection"},{name:"TRN"},{name:"Routed from Other Product"}],pubCategories:[{name:"Pub-AddOwner"},{name:"Pub-AdvancedTab"},{name:"Pub-HouseSurveys"},{name:"Pub-Frequency/Metering"},{name:"Pub-RHS"},{name:"Pub-AnchoredPrompt"},{name:"Pub-Triggerprompt/Async"},{name:"Pub-Callback"},{name:"Pub-CountryFiltering"},{name:"Pub-DomainFilter/refer"},{name:"Pub-PromptTitle"},{name:"Pub-PublisherExtendedAccessPeriod"},{name:"Pub-aaumessage"},{name:"Pub-Staging"},{name:"Pub-MobilePromptMessage"},{name:"Pub-ZipcodeFilter"},{name:"Pub-Selfie"},{name:"Pub-Strategic"},{name:"Pub-Policy"},{name:"Pub-ReportingDashboard"},{name:"Pub-AdSense/Payment"},{name:"Pub-Troubleshoot/Investigate"},{name:"Pub-Troubleshoot/InvestigateTriggerAsync"},{name:"Pub-Troubleshoot/InvestigateAnchored"},{name:"Pub-Troubleshoot/InvestigateCallback"},{name:"Pub-Troubleshoot/InvestigateCan'tSignUp"},{name:"Pub-Troubleshoot/InvestigateInventory"},{name:"Pub-AdvancedOthers"},{name:"Pub-FrequencyMeteringOthers"},{name:"Pub-TriggerPromptOthers"},{name:"Pub-CallbackOthers"},{name:"Pub-RHSOthers"},{name:"Pub-AnchoredPromptOthers"},{name:"Pub-dev"},{name:"Pub-dev>whitelist"},{name:"Pub-dev>approve"},{name:"Pub-SameIssue"},{name:"Pub-NeedsInfo"},{name:"Pub-Consult"},{name:"Pub-CallRequest"},{name:"Pub-CallDone"},{name:"Pub-Reach out"},{name:"Pub-Disabled"},{name:"Pub-SelfDisable"},{name:"Pub-General"},{name:"Pub-NewSelfie"},{name:"Pub-NewStrategic"},{name:"Pub-Feedback"},{name:"Pub-ProductFeedback"},{name:"Pub-UserFeedback"},{name:"TRN"},{name:"Support-Websat"}],partnershipCategories:[{name:"Partnership > DCLK - DBM > Approved"},{name:"Partnership > DCLK - DBM > Rejected"},{name:"Partnership > DCLK - DBM - Auto Reject"},{name:"Partnership > DCLK - DCM > Approved"},{name:"Partnership > DCLK - DCM > Rejected"},{name:"Partnership > DCLK - DCM - Auto Reject"},{name:"Partnership > DCLK - DS > Approved"},{name:"Partnership > DCLK - DS > Rejected"},{name:"Partnership > DCLK - DS - Auto Reject"},{name:"Partnership > GA360 - DS > Approved"},{name:"Partnership > GA360 - DS > Rejected"},{name:"Partnership > GA360 - GTM > Approved"},{name:"Partnership > GA360 - GTM > Rejected"},{name:"Partnership > GA360 - Optimize > Approved"},{name:"Partnership > GA360 - Optimize > Rejected"},{name:"Partnership > Forum Access Request > Approved"},{name:"Partnership > Forum Access Request > Rejected"},{name:"Partnership > GACP - Support"},{name:"Partnership > GACP - Escalate"},{name:"Partnership > DCLCK - Creative > Approved"},{name:"Partnership > DCLCK - Creative > Rejected"},{name:"Partnership > DCLCK - Creative - Auto Reject"},{name:"Partnership > DCLCK - Surveys > Approved"},{name:"Partnership > DCLCK - Surveys > Rejected"},{name:"Partnership-Consult"},{name:"TRN"}],nonTransactionCategories:[{name:"NonTransaction-Data/Reporting"},{name:"NonTransaction-Systembug"},{name:"NonTransaction-Test/Experiment"},{name:"NonTransaction-Other"}],targetingOptions:[{type:"External",options:["PubNet","AdMob","WebSat","GOR"]},{type:"Surveys360",options:["PubNet","AdMob","RMK","Zip","DMANielsen","WebSat","GOR"]},{type:"API-External(Surveys360)",options:[]},{type:"API-Internal",options:[]},{type:"AdsLab",options:["PubNet","AdMob"]},{type:"Crust",options:[]},{type:"Googler",options:["PubNet","AdMob","RMK","Zip","DMANielsen","WebSat","GOR"]},{type:"Hats",options:[]}],studyChecker:{GTGLabel:[{label:"Refers to Sex",cr:"Your survey includes content with reference to sex."},{label:"Weight Loss Programs",cr:"Your survey includes content about weight loss programs."},{label:"Allowed Birth Control",cr:"Your survey includes content about allowed birth control."},{label:"Political Issues",cr:"Your survey includes content about political issues."},{label:"Political Candidates",cr:"Your survey includes content about political candidates."},{label:"Video Games",cr:"Your survey includes content about video games."},{label:"Alcohol",cr:"Your survey includes content about alcohol."},{label:"Gambling",cr:"Your survey includes content about gambling."}],NGTGLabel:[{label:"Adult Activities",cr:"Your survey includes content about adult activities."},{label:"Sexual Behavior",cr:"Your survey includes content about sexual behavior."},{label:"Drugs",cr:"Your survey includes content about drugs."},{cr:"Your survey includes content about guns.",label:"Guns"},{cr:'Your survey contains a spelling or grammatical error. Please correct it by editing the answer option "" into "".',label:"Spelling and Grammar"},{cr:"Your survey has answer options in a different language than the question.",label:"Wrong Language"},{cr:'Questions and answers should be grammatically clear, contextually relevant and directly associate with your survey content. Please edit the answer option "" to make it compliant.',label:"Garbage Text"},{cr:'The question doesn\'t seem to match with the answer options. Please edit or change the answer option/s "".',label:"Irrelevant"},{cr:'Your survey already includes a "None of the Above" option by default.',label:"None of the Above Answer"},{cr:"Your survey includes content about financial status.",label:"Financial Status"},{cr:"Your survey includes content about getting rich.",label:"Get Rich"},{cr:"Your survey includes content about loans or lending services.",label:"Loans"},{cr:"Your survey includes content about hospitals or health care facilities.",label:"Hospitals"},{cr:"Your survey includes content about weight loss pills.",label:"Weight Loss Pills"},{cr:"Your survey includes content about OTC drugs",label:"OTC Drugs"},{cr:"Your survey includes content about non-OTC drugs.",label:"Non-OTC Drugs"},{cr:"Your survey includes content about health conditions.",label:"Health Conditions"},{cr:"Your survey includes content about cosmetic procedures.",label:"Cosmetic Procedures"},{cr:"Your survey includes content about sexual health.",label:"Sexual Health"},{cr:"Your survey includes content about birth control products or methods.",label:"Disallowed Birth Control"},{cr:"Your survey includes content about medical treatments.",label:"Medical Treatments"},{cr:"Your survey contains inappropriate language.",label:"Inappropriate Language"},{cr:"Your survey includes content about harassment.",label:"Harassment"},{cr:"Your survey includes content about political issues.",label:"Political Issues"},{cr:"Your survey includes content about political candidates.",label:"Political Candidates"},{cr:"Your survey includes content about political affiliation.",label:"Political Affiliation"},{cr:"Your survey includes content about age.",label:"Age"},{cr:"Your survey includes content about gender",label:"Gender"},{cr:"Your survey includes content about sexual orientation.",label:"Sexual Orientation"},{cr:"Your survey includes content about race or ethnicity.",label:"Race Ethnicity"},{cr:"Your survey includes content about religion.",label:"Religion"},{cr:"Your survey includes content about immigration or immigrants.",label:"Immigration"},{cr:"Your survey includes content about death.",label:"Death"},{cr:"Your survey includes content about criminal record.",label:"Past Criminal Record"},{cr:"Your survey includes content about personally identifiable information.",label:"PII"},{cr:"Your survey includes content about alcohol.",label:"Alcohol"},{cr:"Your survey includes content about gambling.",label:"Gambling"},{cr:"Your survey includes content about push polling or promotion.",label:"Push Polling"},{cr:"Your survey includes content about trade union.",label:"Trade Union"},{cr:"Your survey includes content about _____.",label:"Other Forbidden (any other reason that is not captured by other policies)"}]}};

checkValidURL();

function init(){
    showFAB();
    
    
    const assignSurvey = document.querySelector('#assignSurvey'),
          unassignSurvey = document.querySelector('#unassignSurvey'),
          needsInfoBtn = document.querySelector('#needsInfoBtn'),
          consultBtn = document.querySelector('#consultBtn'),
          trackBtn = document.querySelector('#trackBtn'),
          caseID = document.querySelector('#caseID'),
          card1 = document.querySelector('#card-1'),
          card2 = document.querySelector('#card-2'),
          queueSelect = document.querySelector('#queue-select'),
          compliantBtn = document.querySelector('#compliant-btn'),
          noncompliantBtn =  document.querySelector('#noncompliant-btn'),
          closeBtn = document.querySelector('#close-btn'),
          enableActions = document.querySelector('#enable_actions'),
          closeCase = document.querySelector('#closeCase'),
          countryInput = document.querySelector('#countryInput'),
          languageInput = document.querySelector('#languageInput'),
          settingsDropdown = document.querySelector('#settings-dropdown'),
          notificationsDropdown = document.querySelector('#notifications-dropdown'),
          notificationsBtn = document.querySelector('#notifications-btn'),
          blsModeSwitch = document.querySelector('#blsModeSwitch'),
          restoreSettingsBtn = document.querySelector('#restoreSettingsBtn'),
          darkModeSwitch = document.querySelector('#darkModeSwitch'),
          cardNav = document.querySelector('#card-nav'),
          targetingCategories = document.querySelector('#targeting-categories'),
          targetingDropdown = document.querySelector('#targeting-dropdown'),
          rmto = document.querySelector('#rmto'),
          blsChecker = document.querySelector('#blsChecker'),
          caseTemplateBtn = document.querySelector('#caseTemplateBtn'),
          consultTable = document.querySelector('#consultTable'),
          selectSurveyDecision = document.querySelector("#selectSurveyDecision"),
          refreshInterval = '',
          searchData = [],
          searchInput= document.querySelector("#searchInput"),
          searchWrapper= document.querySelector("#searchWrapper"),
          searchResultsList= document.querySelector("#searchResultsList"),
          changePosition = document.querySelector("#changePosition"),
          tableTitle = document.querySelector("#tableTitle"),
          btnTableConsult = document.querySelector("#btnTableConsult"),
          btnTableSubmitted = document.querySelector("#btnTableSubmitted"),
          getConsultedCasesBtn = document.querySelector('#getConsultedCasesBtn'),
          showTemper = document.querySelector('#showTemper'),
          viewTemper = document.querySelector('#viewTemper'),
          showMV = document.querySelector('#showMV'),
          viewMV = document.querySelector('#viewMV'),
          showNI = document.querySelector('#showNI'),
          enableCaseAlarm = document.querySelector('#caseReminder'),
          consultMonitoring = document.querySelector('#consultMonitoring');

        

    // Intialize Materialize Elements
    $('.collapsible').collapsible();
    $('ul.tabs').tabs();
    // $('.tooltipped').tooltip({delay: 50});
    $('.chips').material_chip();

    $('#settings-btn').dropdown({
        inDuration: 100,
        outDuration: 75,
        constrainWidth: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 5, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'bottom', // Displays dropdown with edge aligned to the left of button
        stopPropagation: true // Stops event propagation
      }
    );
    $('#notifications-btn').dropdown({
        inDuration: 100,
        outDuration: 75,
        constrainWidth: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 5, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'bottom', // Displays dropdown with edge aligned to the left of button
        stopPropagation: true // Stops event propagation
      }
    );
    
    const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        }),
        MSwal = Swal.mixin({
          customClass: {
            confirmButton: 'btn blue swal-btn',
            cancelButton: 'btn grey swal-btn'
          },
          buttonsStyling: false
        });

        
    // MSwal.fire({
    //   title: 'Are you sure?',
    //   text: "You won't be able to revert this!",
    //   icon: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes, delete it!',
    //   cancelButtonText: 'No, cancel!',
    //   reverseButtons: true
    // })
    // Toast.fire({
    //   icon: 'success',
    //   title: 'Signed in successfully'
    // })
    
    
    caseID.focus();

    // Initialize browser-default element

    // Default selected queue
    surveyReviewQueue();

    // Dark Mode
    checkDarkMode();

    // BLS Mode
    checkBLSMode();

    // Change position
    checkPosition();
    
    // Temper button
    checkTemper();
    
    // Temper button
    checkMV();
    
    // ShowNI
    checkNI();
    
    // Check Case Reminder
    checkCaseReminder();
    
    checkConsultMonitoring();
    
    // Check notifications
    checkNotifications();

    
    // View Consulted Table
    getConsultedCasesBtn.addEventListener('click', getConsultedCases);

    // Table View
    btnTableConsult.addEventListener('click', () => {
        tableTitle.textContent = 'Consulted Cases';
        tableTitle.setAttribute("data-id", "consulted");
        btnTableSubmitted.classList.toggle('darken-4');
        btnTableConsult.classList.toggle('darken-4');

        let tableSelected = tableTitle.dataset.id;
        document.querySelector('#ni-table-loader').classList.toggle('hide');
        getConsultedBucket();
    });

    btnTableSubmitted.addEventListener('click', () => {
        tableTitle.textContent = 'Submitted Cases';
        tableTitle.setAttribute("data-id", "submitted");
        btnTableSubmitted.classList.toggle('darken-4');
        btnTableConsult.classList.toggle('darken-4');

        let tableSelected = tableTitle.dataset.id;
        document.querySelector('#ni-table-loader').classList.toggle('hide');
        // getNIBucket("submitted");
        getSubmittedBucket();
    });
            
    consultTable.addEventListener('click', () => {
        let tableSelected = tableTitle.dataset.id;

        $('#nimodal').modal('open');
        document.querySelector('#ni-table-loader').classList.toggle('hide');
        // loadNITable();
        
        let go = tableSelected == "submitted" ? getSubmittedBucket() : getConsultedBucket();
        
    });
    
    viewTemper.addEventListener('click', () => {
      
        // let tableSelected = tableTitle.dataset.id;
        
        // $('#temperModal').modal('open');
        
        $('#bottomModal1').modal('open');
        // document.querySelector('#ni-table-loader').classList.toggle('hide');
        // // loadNITable();
        
        // let go = tableSelected == "submitted" ? getSubmittedBucket() : gnsultedBucket();
        
    });
    
    viewMV.addEventListener('click', () => {
        $('#MVModal').modal('open');
    });

    searchInput.addEventListener("input", getResults);
    
    // Case ID auto-populate
    caseID.addEventListener('click', (e) => {
        let openedCaseID = localStorage.all_open_cases || "";
        e.target.value = openedCaseID;
        console.log(e.target);
    });

    $('#violations-chip').on('chip.delete', function(e, chip){
        dataChips.splice(dataChips.indexOf(chip.tag), 1);
        console.log(chip.tag);
    });

    // Targeting Categories
    targetingCategories.addEventListener('change', () => {
        const targetingDropdown = document.querySelector('#targeting-dropdown');
        const { targetingOptions } = data;
        const targetingKeys = targetingOptions.map(({ type }) => type);
        let categorySelected = targetingCategories.options[targetingCategories.selectedIndex].value;
        console.log(targetingKeys, targetingKeys.includes(categorySelected))
        // targetingOptions
        // type
        // options
        // check category selected inside map
        // if exist return options in html array
        let optionParser = (category) => {
            if (!targetingKeys.includes(category)) {
                return targetingDropdown.setAttribute('disabled', '');
            }
            targetingDropdown.hasAttribute('disabled') ? targetingDropdown.removeAttribute('disabled') : ''
            const targetingOptionsFiltered = targetingOptions.filter(({ type }) => type == category);
            const [{ options }] = targetingOptionsFiltered;
            const optionsArray = options.map((targeting) => {
                return `<option class="toggleable" value="${targeting}">${targeting}</option>`
            })
            
            !options.length 
            ? targetingDropdown.setAttribute('disabled', '') 
            : ''
            optionsArray.unshift(`<option value="" disabled selected="selected">Select Targeting</option>`)

            return optionsArray.join('');
        }

        let options = optionParser(categorySelected);
        targetingDropdown.innerHTML = options;

        

        // console.log(dependentTargetingOptions)

        // console.log(targetingDropdown, data.targetingOptions)
            
        // console.log(categorySelected + targetingChips);
        
        targetingChips.push({tag: categorySelected});
        $('#targeting-chips').material_chip({
            data: targetingChips
        });
    });

    $('#targeting-chips').on('chip.delete', function(e, chip){
        targetingChips.splice(targetingChips.indexOf(chip.tag), 1);
        console.log(chip.tag);
    });

    // Assign
    assignSurvey.addEventListener('click', () => {
        !caseID.value ? caseID.classList.toggle('invalid') : doAssign();
    });


    trackBtn.addEventListener('click', (function(){
        console.log('f');
        document.querySelector('#trackerUL').classList.toggle("scale-in");
    }));

    // Unassign
    unassignSurvey.addEventListener('click', doUnassign);

    // Needs Info
    needsInfoBtn.addEventListener('click', doNeedsInfo);

    // Consult
    consultBtn.addEventListener('click', doConsult);
           
    // Decision Undo/Back
    enableActions.addEventListener('click', doEnableActions);

    // BLS Checker
    blsChecker.addEventListener('click', () => {
        $('#modal1').modal('open');
    });
    
    // Case Template Modal Click Handler
    caseTemplateBtn.addEventListener('click', () => {
        $('#templateModal').modal('open');
        getTemplateBucket();
    // templateTableLoader
    // templateTable
    // templateTbody
    });
    

    

    // inputID
    // resultBtn
    // manageResultBtn
    document.querySelector('#resultBtn').addEventListener('click', doCheckResult);
    document.querySelector('#manageResultBtn').addEventListener('click', doManageResult);

    selectSurveyDecision.addEventListener('change', toggleLabels);

    countryInput.addEventListener('input', countryListener);
    languageInput.addEventListener('input', languageListener);
    


    // removed functions

    function doManageResult(){
        document.querySelector('#resultTab').classList.toggle("hide", true);
        document.querySelector('#manageResultTab').classList.toggle("hide", false);
        toggleLabels();
        console.log("yey");
    }

    function toggleLabels(){
        const labelsRow = document.querySelector("#labelsRow");

        let select = document.querySelector('#selectSurveyDecision').value,
            selectCurrentLabel = select !== "NGTG" ?
                data.studyChecker.GTGLabel :
                data.studyChecker.NGTGLabel,
            checkboxCol = select !== "NGTG" ? "s6" : "s4";

        // checkbox reset
        labelsRow.innerHTML = "";
        
        selectCurrentLabel.forEach((checkbox) => {
            let newcheckbox = window.document.createElement('div'),
                checkboxID = checkbox.label.replace(/\s/g,'');
            newcheckbox.classList.add("col", checkboxCol);
            newcheckbox.innerHTML = `
                <p>
                    <input type="checkbox" class="filled-in" id="${checkboxID}" />
                    <label for="${checkboxID}">${checkbox.label}</label>
                </p>
            `;
            labelsRow.appendChild(newcheckbox);
        });
        console.log(`labels: ${selectCurrentLabel}`);
        
    }


    // Submit
    closeCase.addEventListener('click', () =>{
        console.log(document);
        
        MSwal.fire({
          // target: document.querySelector('.fixed-action-btn.click-to-toggle'),
          html: `
            <div style="display: flex;justify-content: space-between;align-items: center;width: 100%;">
                <h4 style="color: rgba(33,33,33,0.55)">Case Summary</h4>
                <a id="saveTemplateBtn" class="center-align">Save as template</a>
            </div>
              <ul class="collection" id="case-list">
                <li class="collection-item"><label class="active">Categories:</label> <span id="summaryCategories" class="case-summary"></span></li>
                <li class="collection-item"><label class="active">Country:</label> <span id="summaryCountry" class="case-summary"></span></li>
                <li class="collection-item"><label class="active">Language:</label> <span id="summaryLanguage" class="case-summary"></span></li>
                <li class="collection-item"><label class="active">Decision:</label> <span id="summaryDecision" class="case-summary"></span></li>
                <li class="collection-item"><label class="active">Times Reviewed:</label> <span id="summaryTimesReviewed" class="case-summary"></span></li>
                <li class="collection-item"><label class="active">Comment:</label> <span style="max-width: 25ch;" id="summaryComment" class="case-summary"></span></li>
              </ul>
            <small style="
            color: rgba(51,51,51,0.5);
            font-size: 0.60rem;
            ">
                By clicking 'Submit' you acknowledge that you fully reviewed this case and you agree that any errors you may incur falls on your responsibility.
            </small>
          `,
          customClass:{
              confirmButton: 'btn blue swal-btn btn-summary',
              cancelButton: 'btn grey swal-btn btn-summary'
          },
          showCancelButton: true,
          confirmButtonText: 'Submit',
          reverseButtons: true,

          onOpen: () => {
              let ls = JSON.parse(localStorage.assigned),
                summaryCategories = document.querySelector('#summaryCategories'),
                summaryCountry = document.querySelector('#summaryCountry'),
                summaryLanguage = document.querySelector('#summaryLanguage'),
                summaryDecision = document.querySelector('#summaryDecision'),
                summaryTimesReviewed = document.querySelector('#summaryTimesReviewed'),
                summaryComment = document.querySelector('#summaryComment'),
                saveTemplateBtn = document.querySelector('#saveTemplateBtn'),
                caseData = gatherData();
                
                summaryCategories.textContent = decodeURIComponent(caseData.violations);
                summaryCountry.textContent = caseData.country;
                summaryLanguage.textContent = caseData.language;
                summaryDecision.textContent = ls.decision;
                summaryTimesReviewed.textContent = `${caseData.timesReviewed} Times`;
                summaryComment.textContent = caseData.screenshotText;
                saveTemplateBtn.addEventListener('click', doSaveTemplate);
                console.log(caseData);

          },
        }).then((result) => {
          if (result.value) {
              
            preFinish();
            doFetch();
            doFinish();

          } else if (result.dismiss === Swal.DismissReason.cancel){
            // swalWithBootstrapButtons.fire(
            //   'Cancelled',
            //   'Your imaginary file is safe :)',
            //   'error'
            // )
          }
        })
    });

    // RMTO Listener
    rmto.addEventListener('change', () => {
        if (rmto.checked === true) {
            dataChips.push({tag: "Review-ReviewedMoreThanOnce"})
            $('#violations-chip').material_chip({
                data: dataChips
            });
            addSearch("violations-chip");

        } else {
            console.log(dataChips);
        }
    });

    
    // Settings Listeners
    settingsDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Notifications Listener
    notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        let notifications = JSON.parse(localStorage.getItem('notifications'));
        
        //Seen notifications
        notifications.seen = true;
        localStorage.setItem("notifications", JSON.stringify(notifications));
        
        console.log('Notifications button clicked!')
        checkNotifications();
    });
    
    //restore default settings
    restoreSettingsBtn.addEventListener('click', doRestoreSettings);
    // blsModeSwitch
    blsModeSwitch.addEventListener('change', toggleBLSMode);
    // Dark Mode Switch
    darkModeSwitch.addEventListener('change', toggleDarkMode);
    // Change Position Switch
    changePosition.addEventListener('change', togglePosition);
    // Toggle temper view
    showTemper.addEventListener('change', toggleTemper);
    // Toggle MV view
    showMV.addEventListener('change', toggleMV);
    // Toggle NI view
    showNI.addEventListener('change', toggleNI);
    // Case alarm with 5 minutes default
    enableCaseAlarm.addEventListener('change', toggleCaseAlarm);
    //Toggle Consult Monitoring
    consultMonitoring.addEventListener('change', toggleConsultMonitoring);
    

    // Toggle Cases Card Display
    Array.from(document.querySelectorAll('.arrow')).forEach((e) => {
        e.addEventListener('click', () => {
            console.log('toggled');
            toggleCards();
        });
    });

    // Queue Select Form Event Listener
    queueSelect.addEventListener('change', () => {
        let selected = queueSelect.options[queueSelect.selectedIndex].value;
        queueToggle(selected);
        let enableCaseAlarmValue = JSON.parse(settings).case_reminder;
        
        // alarm timer
        // getCurrentQueue();
        if (enableCaseAlarmValue === true){
            getCurrentQueue();
        } else {
          console.log("Alarm is set to: " + enableCaseAlarmValue);
        }
    });

    // Survey Decisions
    compliantBtn.addEventListener('click', () => {
        surveyDecision("compliant");
    });

    noncompliantBtn.addEventListener('click', () => {
        surveyDecision("noncompliant");
    });

    closeBtn.addEventListener('click', () => {
        surveyDecision("deleted");
    });
    
    
    // Country Input Listener
    // countryInput.addEventListener('keyup');

    // Listen for keystroke events
    countryInput.addEventListener('change', function (e) {
        clearTimeout(clearTimeout);
        countryTimeout = setTimeout(() => {
            let lang = languageInput.value;
            
            console.log("auto: " + countryInput.value);
            // auto tag language function
            doChangeLanguage(countryInput.value);
        }, 250);
    });
    
    

    

    pushsurvey();
}

function initPanels(){
    showFABPanels();
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
}),
MSwal = Swal.mixin({
  customClass: {
    confirmButton: 'btn blue swal-btn',
    cancelButton: 'btn grey swal-btn'
  },
  buttonsStyling: false
});


function doRestoreSettings(){
    //restore
    localStorage.removeItem("settings");
    
    localStorage.setItem("settings", JSON.stringify({
        "dark_mode": false,
        "bls_mode": false,
        "change_position": false,
        "show_temper": false,
        "show_MV": false,
        "show_NI": false,
        "case_reminder": false,
        "consult_monitoring": false
        
    }));
    
    let timerInterval
    Swal.fire({
      title: 'Reload Alert',
      html: 'This page will auto-reload. Click outside to cancel.',
      timer: 5000,
      timerProgressBar: true,
      willOpen: () => {
        Swal.showLoading()
        timerInterval = setInterval(() => {
          const content = Swal.getContent()
          if (content) {
            const b = content.querySelector('b')
            if (b) {
              b.textContent = Swal.getTimerLeft()
            }
          }
        }, 100)
      },
      onClose: () => {
        clearInterval(timerInterval)
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        // console.log('I was closed by the timer')
        location.reload();
      }
    })
    
}

function doChangeLanguage(country){
  // get country
  // match country to x language
  // assign languageInput value into x
  // assign languageInput data-langcode into x
  let findCountry = data.languageSelectOptions.filter(e => {
    e.name.toLowerCase().includes(country);
  });
  const gridLanguage = document.querySelector('#grid-language');
  console.log("countryArray: " + findCountry);
  switch (country) {
    case 'Germany':
      languageInput.value = "German (de)";
      languageInput.setAttribute("data-langcode", "de");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Austria':
      languageInput.value = "Austria (de-AT)";
      languageInput.setAttribute("data-langcode", "de-AT");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'United States':
      languageInput.value = "English (en)"
      languageInput.setAttribute("data-langcode", "en");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Australia':
      languageInput.value = "English (Australia)(en-AU)";
      languageInput.setAttribute("data-langcode", "en-AU");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Canada':
      languageInput.value = "English (Canada)(en-CA)";
      languageInput.setAttribute("data-langcode", "en-CA");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'United Kingdom':
      languageInput.value = "English (UK)(en-GB)"
      languageInput.setAttribute("data-langcode", "en-GB");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Spain':
      languageInput.value = "Spanish (es)";
      languageInput.setAttribute("data-langcode", "es");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Indonesia':
      languageInput.value = "Indonesian (id)";
      languageInput.setAttribute("data-langcode", "id");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Japan':
      languageInput.value = "Japanese (ja)";
      languageInput.setAttribute("data-langcode", "ja");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Korea':
      languageInput.value = "Korean (ko)";
      languageInput.setAttribute("data-langcode", "ko");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Russia':
      languageInput.value = "Russian (ru)";
      languageInput.setAttribute("data-langcode", "ru");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Ukraine':
      languageInput.value = "Ukrainian (uk)";
      languageInput.setAttribute("data-langcode", "uk");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    case 'Brazil':
      languageInput.value = "Portuguese (Brazil)(pt-BR)";
      languageInput.setAttribute("data-langcode", "pt-BR");
      gridLanguage.classList.contains('invalid') ? gridLanguage.classList.remove('invalid') : "";
      break;
    default:
      console.log('Country: ' + country + ' is not found.');
  }
}

// added functions
function addResult(listElement, resultArray){
    // Reset result list every input trigger
    listElement.innerHTML = ``;
    
    // For each match add new li result
    resultArray.forEach((result) => {
        let searchResultItem = window.document.createElement('li');
        searchResultItem.classList.add('searchResultItem');
        searchResultItem.addEventListener('mousedown', autoCompleteInput);
        searchResultItem.innerHTML = `${result.name}`;
        searchResultItem.setAttribute("data-langcode", result.langCode);
        listElement.appendChild(searchResultItem);

    });
}

function languageListener(e){
    // filter from countries
    // return result to searchWrapper
    attachSearch(`#${e.target.id}`);
    console.log();

    let searchKeyword = e.target.value,
        languageInput = e.target,
        gridLanguage = languageInput.parentElement,
        searchWrapper = document.querySelector(`#${gridLanguage.id} > .inputWrapper`),
        resultList = searchWrapper.querySelector('.searchResultsList'),
        result = !searchKeyword ? [] : data.languageSelectOptions
            .filter(category => category
            .name
            .toLowerCase()
            .includes(searchKeyword));
    
    
    addResult(resultList, result);

    
}

function countryListener(e){
    // filter from countries
    // return result to searchWrapper
    attachSearch(`#${e.target.id}`);

    let searchKeyword = e.target.value,
        countryInput = e.target,
        gridCountry = countryInput.parentElement,
        searchWrapper = document.querySelector(`#${gridCountry.id} > .inputWrapper`),
        resultList = searchWrapper.querySelector('.searchResultsList'),
        result = !searchKeyword ? [] : data.countrySelectOptions
            .filter(category => category
            .name
            .toLowerCase()
            .includes(searchKeyword));
    
    
    
    addResult(resultList, result);
}

function attachSearch(parentID){
    
    let inputElement = document.querySelector(parentID),
        searchWrapperDiv = window.document.createElement('div');

    searchWrapperDiv.classList.add("inputWrapper");
    searchWrapperDiv.innerHTML = `
        <ul class="searchResultsList"></ul>
    `;
    inputElement.innerHTML = "";
    inputElement.parentElement.appendChild(searchWrapperDiv);
}


function autoCompleteInput (e){
    
    let inputElement = e.target
                    .parentElement
                    .parentElement
                    .parentElement
    .querySelector('.autocomplete');
    inputElement.value = e.target.textContent
    inputElement.setAttribute("data-langcode", e.target.dataset.langcode);
}


function addSearch(parent){
     let parentElement = document.querySelector(`#${parent}`),
         chipsElement = document.querySelector('#violations-chip > input'),
         searchWrapperDiv = window.document.createElement('div');

     chipsElement.setAttribute("placeholder", "+Review-");
     chipsElement.addEventListener('input', getResults);
     searchWrapperDiv.setAttribute("id", "searchWrapper");
     searchWrapperDiv.innerHTML = `
         <ul id="searchResultsList"></ul>
     `;
     parentElement.appendChild(searchWrapperDiv);
}
addSearch("violations-chip");


function getResults(e){
    let searchIndex = e.target.value,
        selectedQueue = getSelectedQueue(),
        // Filter category using searchIndex
        searchFilter = selectedQueue.filter(category => category.name.toLowerCase().includes(searchIndex)),
        // searchFilter = selectedQueue.filter(category => category.name .includes(searchIndex)),
        searchResultsList = document.querySelector("#searchResultsList");

        

    // Reset result list every input trigger
    searchResultsList.innerHTML = ``;
    
    // For each match add new li result
    searchFilter.forEach((result) => {
        let searchResultItem = window.document.createElement('li');
        searchResultItem.classList.add('searchCategoryItem');

        searchResultItem.innerHTML = `${result.name}`;
        searchResultsList.appendChild(searchResultItem);
        
    });

    // change this
    let showedItems = document.querySelectorAll('.searchCategoryItem') || [];


    searchResultListener(searchFilter, showedItems);

}

function searchResultListener(filteredArray, resultArray){
    if (filteredArray.length != 0){

        Array.from(resultArray).forEach((item) => {
            // console.log(item);
            item.addEventListener('mousedown', (e) => {
                dataChips.push({tag: e.target.textContent})
                $('#violations-chip').material_chip({
                    data: dataChips
                });
                addSearch("violations-chip");
            });
        });
    }
}



function doCheckResult(){
  const url = "https://script.google.com/a/google.com/macros/s/AKfycbw6tEzDQXsxVzmGOSNnfL9yZrCSJKxSLNxq7QriThKh/dev?action=search&keyword=";
  let parameterID = document.querySelector('#inputID').value,
    fetchURL = url + parameterID,
    tableLoader = document.querySelector('#table-loader'),
    table = document.querySelector('#table'),
    resultTab = document.querySelector('#resultTab'),
    manageResultTab = document.querySelector('#manageResultTab');
  
  tableLoader.classList.toggle('hide');
  resultBtn.classList.toggle('disabled');
  resultTab.classList.toggle('hide', false);
  manageResultTab.classList.toggle('hide', true);

  fetch(fetchURL)
    .then((response) => response.text())
        .then((data) => {
            console.log("CHECKER: " + JSON.parse(data) + typeof JSON.parse(data));
            if (data !== null || data !== ""){
                displayResults(JSON.parse(data));
            } else {
                console.log("not found. add instead?");
            }
            
            tableLoader.classList.toggle('hide');
            resultBtn.classList.toggle('disabled');
            table.classList.toggle('hide', false);
    })
}

function displayResults(results){
    let arrayAgain = [],
        tbody = document.querySelector('#results'),
        justAnotherArray = [];
    Object.entries(results).forEach((e) => {
        arrayAgain.push(e[1].replace(/\"/g, ""));
    });
    // separate "results" into another array other every 10th element
    const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
    let again = array_chunks(arrayAgain, 10);
    again.pop();
    console.log("again: " + again);

    // clear tbody every after new result
    tbody.innerHTML = '';
    again.forEach((tr) => {
        tr.splice(1,1);
        console.log("tr: " + tr);
        let row = window.document.createElement('tr'),
            tbody = document.querySelector('#results'),
            manageResult = window.document.createElement('button');

        row.classList.add("result-row");

        manageResult.innerHTML = `
                <i class="material-icons">add</i>
            `;
        manageResult.classList.add("manageResultBtn");
        
        row.appendChild(manageResult);
        tr.forEach((td) => {
            let tdElement = window.document.createElement('td');
            tdElement.innerHTML = td;
            row.appendChild(tdElement);
        });
        tbody.appendChild(row);
    });
}


function toggleCards(){
    const card1 = document.querySelector('#card-1'),
        card2 = document.querySelector('#card-2');

    card2.classList.toggle('show');
    card1.classList.toggle('hide');
}




function showFAB(){
    const fab = window.window.document.createElement('div');
    fab.classList.add('fixed-action-btn', 'click-to-toggle');
    fab.innerHTML = `
        <a id="trackBtn" class="btn-floating blue darken-1" style="width: 56px; height: 56px; line-height: 56px; border-radius: 50px;">
            <i class="large material-icons" style="font-size: 24px;">playlist_add</i>
        </a>
        <ul id="trackerUL" class="scale-transition scale-out" style="position: absolute; left: -290px; width: 400px;">
            
            <li style="margin: 0px; list-style: none!important;">
                <div class="row">
                    <div class="col s12">
                        <div id="card-nav" style="box-sizing: border-box; background: #546e7a; color: #fff; width: 100%; height: 38px; position: block; display: flex; justify-content: space-between; padding: 16px 8px; align-items: center;">
                            <p style="font-size: 16px;">Cases Tracker</p>
                            
                            <!-- Dropdown Trigger -->
                            <div>
                                <a class='ct-nav-icons' id="notifications-btn" href='#' data-activates='notifications-dropdown' style="color: #fff;"><i class="material-icons">notifications</i></a>
                                <a class='ct-nav-icons' id="settings-btn" href='#' data-activates='settings-dropdown' style="color: #fff;"><i class="material-icons">settings</i></a>
                            </div>
                            
                            
                            <!-- Notifications Dropdown-->
                            <ul id='notifications-dropdown' class='dropdown-content' style="max-width: 70%; z-index: 11111111111111;">
                                <li style="cursor: default;">
                                    <h3 style="color: #9e9e9e; margin: 0 16px;">Notifications</h1>
                                </li>
                                <li>
                                    <a class="modal-trigger" href="#nimodal">Your consulted case
                                        <span id="myConsultedText" data-badge-caption="cases" class="new badge red">0</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="modal-trigger" href="#nimodal">All consulted case
                                        <span id="allConsultedText" data-badge-caption="cases" class="new badge red">0</span>
                                    </a>
                                </li>
                            </ul>
                            
                            
                            <!-- Settings Dropdown Structure -->
                            <ul id='settings-dropdown' class='dropdown-content' style="max-width: 70%; z-index: 11111111111111;">
                                <li style="cursor: default;">
                                    <h3 style="color: #9e9e9e; margin: 0 16px;">Settings</h1>
                                    <a id="restoreSettingsBtn" style="text-align: right; cursor:pointer;">
                                        <i class="material-icons right">restore</i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#!">BLS Mode</a>
                                    <div class="switch" id="blsModeSwitch" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Dark Mode</a>
                                    <div class="switch" id="darkModeSwitch" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Change Position</a>
                                    <div class="switch" id="changePosition" style="margin-right: 16px;">
                                        <label>
                                            Right
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            Left
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Show Temper</a>
                                    <div class="switch" id="showTemper" style="margin-right: 16px;">
                                        <label>
                                            False
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            True
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Show Scraper</a>
                                    <div class="switch" id="showMV" style="margin-right: 16px;">
                                        <label>
                                            False
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            True
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Show NI</a>
                                    <div class="switch" id="showNI" style="margin-right: 16px;">
                                        <label>
                                            False
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            True
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Case Reminder</a>
                                    <div class="switch" id="caseReminder" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Consult Monitoring</a>
                                    <div class="switch" id="consultMonitoring" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="card-1" class="card" style="min-height: 400px; margin-top: 0px;">
                            <div class="card-content">
                                <div class="row">
                                    <h1 style="font-weight: bold;" id="aht">00:00:00</h1>
                                    <div class="input-field col s12 center-align">
                                        <input id="caseID" type="text" class="validate center-align" placeholder="Case ID: 2-43060000282111" autocomplete="off">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card-action">
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="assignSurvey" class="primary-btn btn waves-effect blue waves-light white-text">
                                        <i class="material-icons left">playlist_play</i>TAKE
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="unassignSurvey" class="primary-btn btn blue darken-3 waves-effect waves-light white-text disabled">
                                        <i class="material-icons left">clear_all</i>UNASSIGN
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="consultBtn" class="primary-btn btn teal darken-1 waves-effect waves-light white-text disabled">
                                        <i class="material-icons left">question_answer</i>CONSULT
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="consultTable" class="primary-btn btn teal darken-2 waves-effect waves-light white-text">
                                        <i class="material-icons left">view_list</i>VIEW CASES
                                    </a>
                                </div>
                                <div class="col s12 hide" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="viewTemper" class="primary-btn btn teal darken-3 waves-effect waves-light white-text">
                                        <i class="material-icons left">pause</i>VIEW TEMPER
                                    </a>
                                </div>
                                <div class="col s12 hide" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="viewMV" class="primary-btn btn cyan darken-2 waves-effect waves-light white-text">
                                        <i class="material-icons left">art_track</i>BLS SCRAPER
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="needsInfoBtn" class="primary-btn btn teal darken-4 waves-effect waves-light white-text disabled">
                                        <i class="material-icons left">pause</i>NEEDS INFO
                                    </a>
                                </div>
                            </div>
                            <div>
                                <a class="downArrow arrow" style="color: #546e7a;"><i class="material-icons gray" style="font-size: 3rem;">expand_more</i></a>
                            </div>
                        </div>
                        <div id="card-2" class="card">
                            <div class="card-content">
                                <div class="row">
                                    <div class="col s12">
                                        <label class="active">Queue Select</label>
                                        <select class="browser-default" id="queue-select">
                                            <option value="" disabled>Choose your option</option>
                                            <option value="Support">SUPPORT</option>
                                            <option value="Publisher">PUBLISHER</option>
                                            <option value="Publisher-New">PUBLISHER-NEW</option>
                                            <option value="Publisher-Support">PUBLISHER-SUPPORT</option>
                                            <option value="Survey Review" selected="selected">SURVEY REVIEW</option>
                                            <option value="Partnership">PARTNERSHIP</option>
                                            <option value="NonTransaction">NON-TRANSACTION</option>
                                        </select>
                                        
                                    </div>
                                    <div class="col s4 hide" style="padding-top: 2rem;">
                                        <input type="checkbox" id="rmto" class="">
                                        <label for="rmto">RMTO</label>
                                    </div>
                                    

                                    <div id="queueChange-elements" class="col s12">
                                        <label class="active" for="violations-chip">Categories</label>
                                        <input placeholder="Review-SurveyStarted" id="searchInput" type="text" class="validate hide"  autocomplete="new-password" style="margin-bottom: 5px;">
                                        
                                        <div id="violations-chip" class="chips chips-initial chips-autocomplete" style="margin-top: 5px; border-bottom: 1px solid #9E9E9E;">
                                            
                                        </div>
                                    </div>
                                    

                                    <div class="input-field col s12 hide" id="grid-country">
                                        <label class="active">Country</label>
                                        <select class="browser-default hide" id="country-select">
                                            <option value="" disabled selected="selected">Select One</option>
                                        </select>
                                        <input type="text" id="countryInput" class="autocomplete" autocomplete="new-password" placeholder="United States">
                                    </div>

                                    <div class="input-field col s12 hide" id="grid-language">
                                        <label class="active">Language</label>
                                        <select class="browser-default hide" id="lang-select">
                                            <option value="" disabled selected="selected">Select One</option>
                                        </select>
                                        <input type="text" id="languageInput" class="autocomplete" autocomplete="new-password" placeholder="English..." required>
                                        
                                    </div>

                                    <div id="" class="col s12">
                                        <label class="active" for="targeting-categories">Survey Type</label>
                                        <select class="browser-default" id="targeting-categories">
                                            <option value="" disabled selected="selected">Network Type</option>
                                            <option 
                                                class="${JSON.parse(localStorage.settings).bls_mode ? "" : "hide"}"
                                                value="BLS2"
                                                ${JSON.parse(localStorage.settings).bls_mode ? "selected" : ''}
                                            >BLS2</option>
                                            <option class="toggleable" value="External">External</option>
                                            <option class="toggleable" value="Surveys360">Surveys360</option>
                                            <option class="toggleable" value="API-External(Surveys360)">API-External(Surveys360)</option>
                                            <option class="toggleable" value="API-Internal">API-Internal</option>
                                            <option class="toggleable" value="AdsLab">AdsLab</option>
                                            <option class="toggleable" value="Crust">Crust</option>
                                            <option class="toggleable" value="Googler">Googler</option>
                                            <option class="toggleable" value="Hats">Hats</option>
                                        </select>
                                        <div id="targeting-chips" class="hide chips chips-initial chips-autocomplete" style="margin-top: 5px;">
                                            
                                        </div>
                                    </div>

                                    <div id="" class="col s12 toggleable">
                                        <label class="active" for="targeting-dropdown">Targeting</label>
                                        <select class="browser-default" id="targeting-dropdown">
                                            <option value="" disabled selected="selected">Select Targeting</option>
                                            <option class="toggleable" value="PubNet">PubNet</option>
                                            <option class="toggleable" value="AdMob">AdMob</option>
                                            <option class="toggleable" value="RMK">RMK</option>
                                            <option class="toggleable" value="Zip">Zip</option>
                                            <option class="toggleable" value="DMANielsen">DMANielsen</option>
                                            <option class="toggleable" value="WebSat">WebSat</option>
                                            <option class="toggleable" value="GOR">GOR</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col s6">
                                        <label># of Questions</label>
                                        <select class="browser-default" id="numberOfQuestions">
                                            <option value="" selected>Questions</option>
                                            <option value="1">One</option>
                                            <option value="2">Two</option>
                                            <option value="3">Three</option>
                                            <option value="4">Four</option>
                                            <option value="5">Five</option>
                                            <option value="6">Six</option>
                                            <option value="7">Seven</option>
                                            <option value="8">Eight</option>
                                            <option value="9">Nine</option>
                                            <option value="10">Ten</option>
                                        </select>
                                    </div>

                                    <div class="col s6">
                                        <label># Times Reviewed</label>
                                        <select class="browser-default" id="timesReviewed">
                                            <option value="" selected>Reviews</option>
                                            <option value="0" >0 Time</option>
                                            <option value="1">1 Time</option>
                                            <option value="2">2 Times</option>
                                            <option value="3">3 Times</option>
                                            <option value="4">4 Times</option>
                                            <option value="5">5 Times</option>
                                            <option value="6">6 Times</option>
                                            <option value="7">7 Times</option>
                                            <option value="8">8 Times</option>
                                            <option value="9">9 Times</option>
                                            <option value="10">10 Times</option>
                                            <option value="11">11 Times</option>
                                            <option value="12">12 Times</option>
                                            <option value="13">13 Times</option>
                                            <option value="14">14 Times</option>
                                            <option value="15">15 Times</option>
                                            <option value="16">16 Times</option>
                                            <option value="17">17 Times</option>
                                            <option value="18">18 Times</option>
                                            <option value="19">19 Times</option>
                                            <option value="20">20 Times</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col s12">
                                        <label>Customer Type</label>
                                        <select class="browser-default" id="customer-type">
                                            <option value="" disabled selected="selected">Choose your option</option>
                                            <option value="Surveys360">Surveys360</option>
                                            <option value="Googler">Googler</option>
                                            <option value="External">External</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col s12">
                                        <label for="screenshot-text" class="active">Screenshot or Comments</label>
                                        <textarea value="" placeholder="Ex: https://screenshot.googleplex.com/4s123456" id="screenshot-text" type="text" class="materialize-textarea validate"></textarea>
                                    </div>


                                </div>
                            </div>
                        
                            <div id="case-actions" class="card-action row">
                            
                                <div class="col s6 center-align">
                                    <a id="compliant-btn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn disabled green waves-effect waves-light hide">
                                        <i class="material-icons left">thumb_up</i>
                                        <span class="hide-on-chrome">START</span>
                                    </a>
                                </div>
                                <div class="col s6 center-align">
                                    <a id="close-btn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn disabled black darken-3 waves-effect waves-light hide">
                                        <i class="material-icons left">close</i>
                                        <span class="hide-on-chrome">DELETED</span>
                                    </a>
                                </div>
                                <div class="col s6 center-align">
                                    <a id="noncompliant-btn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn disabled red darken-3 waves-effect waves-light hide">
                                        <i class="material-icons left">thumb_down</i>
                                        <span class="hide-on-chrome">NEEDS EDIT</span>
                                    </a>
                                </div>
                                
                                <div class="col s6 center-align">
                                    <a id="caseTemplateBtn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn grey darken-1 waves-effect waves-light hide">
                                        <i class="material-icons left">subject</i>
                                        <span class="hide-on-chrome">Template</span>
                                    </a>
                                </div>

                                <div class="col s6 center-align hide">
                                    <a id="blsChecker" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn indigo waves-effect waves-blue">
                                        <i class="material-icons left">search</i>
                                        <span class="hide-on-chrome">BLS Checker</span>
                                    </a>
                                </div>
                                
                                
                                <div class="col s6 offset-s3 center-align">
                                    <a id="enable_actions" style="margin-bottom: 5px; padding: 0 8px; width: 100%; color: #212121;" class="btn blue-grey lighten-5 disabled waves-effect waves-light hide">
                                        <i class="material-icons left">arrow_back</i>
                                        <span class="hide-on-chrome">BACK</span>
                                    </a>
                                </div>
                                <div class="col s6 offset-s3 center-align">
                                    <a id="closeCase" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn green disabled waves-effect waves-light hide">
                                        <i class="material-icons left">send</i>
                                        <span class="hide-on-chrome">FINISH</span>
                                    </a>
                                </div>
                                                    
                            </div>
                            <div style="text-align: center; position: relative; bottom: 40px; height: 10px;">
                                <a class="upArrow arrow" style="color: #546e7a;"><i class="material-icons" style="font-size: 3rem;">expand_less</i></a>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
          </li>
        </ul>
    `;
    
  //   const shadow = window.document.querySelector('cases-tracker').shadowRoot;
    document.body.appendChild(fab);
    
    addModal();
    addNIModal();
    addTemplateModal();
    addTemperModal();
    // addBottomModal();
    addMVModal();
    addQMModal();
    $('.m-modal').modal();
  //   removed onload getnotifications
    getNotifications();
    // setUserLS();
    
    
    console.log('material chips initialized');
}


function showFABPanels(){
    const fab = window.window.document.createElement('div');
    fab.classList.add('fixed-action-btn', 'click-to-toggle');
    fab.style.cssText = `bottom:80px;`;
    fab.innerHTML = `
        <a id="trackBtn" class="btn-floating blue darken-1" style="width: 56px; height: 56px; line-height: 56px; border-radius: 50px;">
            <i class="large material-icons" style="font-size: 24px;">playlist_add</i>
        </a>
        <ul id="trackerUL" class="scale-transition scale-out" style="position: absolute; left: -290px; width: 400px;">
            
            <li style="margin: 0px; list-style: none!important;">
                <div class="row">
                    <div class="col s12">
                        <div id="card-nav" style="box-sizing: border-box; background: #546e7a; color: #fff; width: 100%; height: 38px; position: block; display: flex; justify-content: space-between; padding: 16px 8px; align-items: center;">
                            <p style="font-size: 16px;">Cases Tracker</p>
                            
                            <!-- Dropdown Trigger -->
                            <div>
                                <a class='ct-nav-icons' id="notifications-btn" href='#' data-activates='notifications-dropdown' style="color: #fff;"><i class="material-icons">notifications</i></a>
                                <a class='ct-nav-icons' id="settings-btn" href='#' data-activates='settings-dropdown' style="color: #fff;"><i class="material-icons">settings</i></a>
                            </div>
                            
                            
                            <!-- Notifications Dropdown-->
                            <ul id='notifications-dropdown' class='dropdown-content' style="max-width: 70%; z-index: 11111111111111;">
                                <li style="cursor: default;">
                                    <h3 style="color: #9e9e9e; margin: 0 16px;">Notifications</h1>
                                </li>
                                <li>
                                    <a class="modal-trigger" href="#nimodal">Your consulted case
                                        <span id="myConsultedText" data-badge-caption="cases" class="new badge red">0</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="modal-trigger" href="#nimodal">All consulted case
                                        <span id="allConsultedText" data-badge-caption="cases" class="new badge red">0</span>
                                    </a>
                                </li>
                            </ul>
                            
                            
                            <!-- Settings Dropdown Structure -->
                            <ul id='settings-dropdown' class='dropdown-content' style="max-width: 70%; z-index: 11111111111111;">
                                <li style="cursor: default;">
                                    <h3 style="color: #9e9e9e; margin: 0 16px;">Settings</h1>
                                    <a id="restoreSettingsBtn" style="text-align: right; cursor:pointer;">
                                        <i class="material-icons right">restore</i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#!">BLS Mode</a>
                                    <div class="switch" id="blsModeSwitch" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Dark Mode</a>
                                    <div class="switch" id="darkModeSwitch" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Change Position</a>
                                    <div class="switch" id="changePosition" style="margin-right: 16px;">
                                        <label>
                                            Right
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            Left
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Show Temper</a>
                                    <div class="switch" id="showTemper" style="margin-right: 16px;">
                                        <label>
                                            False
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            True
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Show Scraper</a>
                                    <div class="switch" id="showMV" style="margin-right: 16px;">
                                        <label>
                                            False
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            True
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Show NI</a>
                                    <div class="switch" id="showNI" style="margin-right: 16px;">
                                        <label>
                                            False
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            True
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Case Reminder</a>
                                    <div class="switch" id="caseReminder" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <a href="#!">Consult Monitoring</a>
                                    <div class="switch" id="consultMonitoring" style="margin-right: 16px;">
                                        <label>
                                            Off
                                            <input type="checkbox">
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="card-1" class="card" style="min-height: 400px; margin-top: 0px;">
                            <div class="card-content">
                                <div class="row">
                                    <h1 style="font-weight: bold;" id="aht">00:00:00</h1>
                                    <div class="input-field col s12 center-align">
                                        <input id="caseID" type="text" class="validate center-align" placeholder="Case ID: 2-43060000282111" autocomplete="off">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card-action">
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="assignSurvey" class="primary-btn btn waves-effect blue waves-light white-text">
                                        <i class="material-icons left">playlist_play</i>TAKE
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="unassignSurvey" class="primary-btn btn blue darken-3 waves-effect waves-light white-text disabled">
                                        <i class="material-icons left">clear_all</i>UNASSIGN
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="consultBtn" class="primary-btn btn teal darken-1 waves-effect waves-light white-text disabled">
                                        <i class="material-icons left">question_answer</i>CONSULT
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="consultTable" class="primary-btn btn teal darken-2 waves-effect waves-light white-text">
                                        <i class="material-icons left">view_list</i>VIEW CASES
                                    </a>
                                </div>
                                <div class="col s12 hide" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="viewTemper" class="primary-btn btn teal darken-3 waves-effect waves-light white-text">
                                        <i class="material-icons left">pause</i>VIEW TEMPER
                                    </a>
                                </div>
                                <div class="col s12 hide" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="viewMV" class="primary-btn btn cyan darken-2 waves-effect waves-light white-text">
                                        <i class="material-icons left">art_track</i>BLS SCRAPER
                                    </a>
                                </div>
                                <div class="col s12" style="display: flex; justify-content: center; margin: 10px;">
                                    <a id="needsInfoBtn" class="primary-btn btn teal darken-4 waves-effect waves-light white-text disabled">
                                        <i class="material-icons left">pause</i>NEEDS INFO
                                    </a>
                                </div>
                            </div>
                            <div>
                                <a class="downArrow arrow" style="color: #546e7a;"><i class="material-icons gray" style="font-size: 3rem;">expand_more</i></a>
                            </div>
                        </div>
                        <div id="card-2" class="card">
                            <div class="card-content">
                                <div class="row">
                                    <div class="col s12">
                                        <label class="active">Queue Select</label>
                                        <select class="browser-default" id="queue-select">
                                            <option value="" disabled>Choose your option</option>
                                            <option value="Support">SUPPORT</option>
                                            <option value="Publisher">PUBLISHER</option>
                                            <option value="Publisher-New">PUBLISHER-NEW</option>
                                            <option value="Publisher-Support">PUBLISHER-SUPPORT</option>
                                            <option value="Survey Review" selected="selected">SURVEY REVIEW</option>
                                            <option value="Partnership">PARTNERSHIP</option>
                                            <option value="NonTransaction">NON-TRANSACTION</option>
                                        </select>
                                        
                                    </div>
                                    <div class="col s4" style="padding-top: 2rem;">
                                        <input type="checkbox" id="rmto" class="">
                                        <label for="rmto">RMTO</label>
                                    </div>
                                    

                                    <div id="queueChange-elements" class="col s12">
                                        <label class="active" for="violations-chip">Categories</label>
                                        <input placeholder="Review-SurveyStarted" id="searchInput" type="text" class="validate hide"  autocomplete="new-password" style="margin-bottom: 5px;">
                                        
                                        <div id="violations-chip" class="chips chips-initial chips-autocomplete" style="margin-top: 5px; border-bottom: 1px solid #9E9E9E;">
                                            
                                        </div>
                                    </div>
                                    

                                    <div class="input-field col s12" id="grid-country">
                                        <label class="active">Country</label>
                                        <select class="browser-default hide" id="country-select">
                                            <option value="" disabled selected="selected">Select One</option>
                                        </select>
                                        <input type="text" id="countryInput" class="autocomplete" autocomplete="new-password" placeholder="United States">
                                    </div>

                                    <div class="input-field col s12" id="grid-language">
                                        <label class="active">Language</label>
                                        <select class="browser-default hide" id="lang-select">
                                            <option value="" disabled selected="selected">Select One</option>
                                        </select>
                                        <input type="text" id="languageInput" class="autocomplete" autocomplete="new-password" placeholder="English..." required>
                                        
                                    </div>

                                    <div id="" class="col s12">
                                        <label class="active" for="targeting-categories">Survey Type</label>
                                        <select class="browser-default" id="targeting-categories">
                                            <option value="" disabled selected="selected">Network Type</option>
                                            <option value="BLS1">BLS1</option>
                                            <option value="BLS2">BLS2</option>
                                            <option class="toggleable" value="Hats">Hats</option>
                                            <option class="toggleable" value="API-Internal">API-Internal</option>
                                            <option class="toggleable" value="API-External">API-External</option>
                                            <option class="toggleable" value="External">External</option>
                                            <option class="toggleable" value="Crust">Crust</option>
                                            <option class="toggleable" value="Googler">Googler</option>
                                            <option class="toggleable" value="Websat">Websat</option>
                                            <option class="toggleable" value="Surveys360">Surveys360</option>
                                        </select>
                                        <div id="targeting-chips" class="hide chips chips-initial chips-autocomplete" style="margin-top: 5px;">
                                            
                                        </div>
                                    </div>
                                    
                                    <div class="col s6">
                                        <label># of Questions</label>
                                        <select class="browser-default" id="numberOfQuestions">
                                            <option value="" selected>Questions</option>
                                            <option value="1">One</option>
                                            <option value="2">Two</option>
                                            <option value="3">Three</option>
                                            <option value="4">Four</option>
                                            <option value="5">Five</option>
                                            <option value="6">Six</option>
                                            <option value="7">Seven</option>
                                            <option value="8">Eight</option>
                                            <option value="9">Nine</option>
                                            <option value="10">Ten</option>
                                        </select>
                                    </div>

                                    <div class="col s6">
                                        <label># Times Reviewed</label>
                                        <select class="browser-default" id="timesReviewed">
                                            <option value="" selected>Reviews</option>
                                            <option value="0" >Zero Time</option>
                                            <option value="1">One Time</option>
                                            <option value="2">Two Times</option>
                                            <option value="3">Three Times</option>
                                            <option value="4">Four Times</option>
                                            <option value="5">Five Times</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col s12">
                                        <label>Customer Type</label>
                                        <select class="browser-default" id="customer-type">
                                            <option value="" disabled selected="selected">Choose your option</option>
                                            <option value="Surveys360">Surveys360</option>
                                            <option value="Googler">Googler</option>
                                            <option value="External">External</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col s12">
                                        <label for="screenshot-text" class="active">Screenshot or Comments</label>
                                        <textarea value="" placeholder="Ex: https://screenshot.googleplex.com/4s123456" id="screenshot-text" type="text" class="materialize-textarea validate"></textarea>
                                    </div>


                                </div>
                            </div>
                        
                            <div id="case-actions" class="card-action row">
                            
                                <div class="col s6 center-align">
                                    <a id="compliant-btn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn disabled green waves-effect waves-light hide">
                                        <i class="material-icons left">thumb_up</i>
                                        <span class="hide-on-chrome">START</span>
                                    </a>
                                </div>
                                <div class="col s6 center-align">
                                    <a id="close-btn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn disabled black darken-3 waves-effect waves-light hide">
                                        <i class="material-icons left">close</i>
                                        <span class="hide-on-chrome">DELETED</span>
                                    </a>
                                </div>
                                <div class="col s6 center-align">
                                    <a id="noncompliant-btn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn disabled red darken-3 waves-effect waves-light hide">
                                        <i class="material-icons left">thumb_down</i>
                                        <span class="hide-on-chrome">NEEDS EDIT</span>
                                    </a>
                                </div>
                                
                                <div class="col s6 center-align">
                                    <a id="caseTemplateBtn" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn grey darken-1 waves-effect waves-light hide">
                                        <i class="material-icons left">subject</i>
                                        <span class="hide-on-chrome">Template</span>
                                    </a>
                                </div>

                                <div class="col s6 center-align hide">
                                    <a id="blsChecker" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn indigo waves-effect waves-blue">
                                        <i class="material-icons left">search</i>
                                        <span class="hide-on-chrome">BLS Checker</span>
                                    </a>
                                </div>
                                
                                
                                <div class="col s6 offset-s3 center-align">
                                    <a id="enable_actions" style="margin-bottom: 5px; padding: 0 8px; width: 100%; color: #212121;" class="btn blue-grey lighten-5 disabled waves-effect waves-light hide">
                                        <i class="material-icons left">arrow_back</i>
                                        <span class="hide-on-chrome">BACK</span>
                                    </a>
                                </div>
                                <div class="col s6 offset-s3 center-align">
                                    <a id="closeCase" style="margin-bottom: 5px; padding: 0 8px; width: 100%;" class="btn green disabled waves-effect waves-light hide">
                                        <i class="material-icons left">send</i>
                                        <span class="hide-on-chrome">FINISH</span>
                                    </a>
                                </div>
                                                    
                            </div>
                            <div style="text-align: center; position: relative; bottom: 40px; height: 10px;">
                                <a class="upArrow arrow" style="color: #546e7a;"><i class="material-icons" style="font-size: 3rem;">expand_less</i></a>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
          </li>
        </ul>
    `;
    
  //   const shadow = window.document.querySelector('cases-tracker').shadowRoot;
    document.body.appendChild(fab);
    
    addModal();
    addNIModal();
    addTemplateModal();
    addTemperModal();
    // addBottomModal();
    addMVModal();
    addQMModal();
    $('.m-modal').modal();
    getNotifications();
    // setUserLS();
    
    
    console.log('material chips initialized');
}

// function setUserLS(){
//     console.log(document.querySelector('.email'))
//     const profileElement = document.querySelector('.email') || undefined,
//         profileLDAP = profileElement != undefined ? profileElement.textContent.split('@')[0] : "",
//         ldap = !localStorage.user ?
//         localStorage.setItem("user", JSON.stringify({
//             "ldap": profileLDAP,
//         })) :
//         console.log('User profile set');
// }

// Original MV Modal
// function addMVModal(){
//   let modal = window.document.createElement('div');
//     modal.classList.add('m-modal');
//     modal.setAttribute("ID", "MVModal");
//     modal.style.transform = 'none';
//     modal.style.width = `65vw`;
//     modal.innerHTML = `
//     <div class="m-modal-content">
//         <div class="container front-page valign-wrapper" style="align-items: baseline; justify-content: space-between; margin: 0rem 0.5rem;">
//             <h2 id="temperHeader">MV</h2>
//             <button class="waves-effect waves-teal btn-flat" id=""><i class="material-icons">refresh</i></button>
//         </div>
//         <div class="row" style="margin-top: 15px;">
//           <div class="col s12 m8 offset-m2">
//             <div class="card">
//               <div class="progress hide">
//                   <div class="indeterminate"></div>
//               </div>
//               <div class="card-content">
//                 <h3 class="center-align card-title">Vertical/Metric Track</h3>

//                 <div class="row">
//                   <div class="input-field col s12">
//                     <label for="cid" class="active">Case ID</label>
//                     <input id="cid" type="text" class="validate" placeholder="Ex: 5-123456789" required>
//                   </div>

//                   <div class="input-field col s12">
//                     <label for="anal" class="active">Vertical</label>
//                     <select class="" id="anal" required>
//                       <option  value="" disabled selected>Choose a vertical</option>
//                     </select>
                    
//                   </div>

//                   <div class="input-field col s12">
//                     <!-- <input id="mtr" type="text" class="validate"> -->
//                     <select multiple id="metricsSelect">
//                       <option  value="" disabled selected>Choose a metric</option>
//                       <option value="Awareness">Awareness</option>
//                       <option value="Ad Recall">Ad Recall</option>
//                       <option value="Consideration">Consideration</option>
//                       <option value="Favorability">Favorability</option>
//                       <option value="Purchase Intent">Purchase Intent</option>
//                     </select>
//                     <label>Survey Metric</label>

//                     <!-- <label for="mtr" class="active">Metrics</label>
//                     <div id="mtr" class="chips chips-placeholder chips-autocomplete"></div> -->
//                   </div>
//                 </div>
//               </div>

//               <div class="card-action">
//                 <a style="width: 90%; margin: 7px 0px; color: #fff;" class="waves-effect waves-light btn-large" id="btn">
//                   <i class="material-icons right" style="color: #fff;">send</i>Submit
//                 </a>
//                 <a style="width: 90%; margin: 7px 0px; color: #fff;" class="waves-effect waves-light btn-large cyan darken-4" id="scrapeBtn">
//                   <i class="material-icons right" style="color: #fff;">send</i>Scrape Cases
//                 </a>
//               </div>
//             </div>
//           </div>
//           <div class="col s12 m8 offset-m2">
//             <div class="card">
            
//               <table class="striped highlight responsive-table centered">
//                 <thead>
//                   <tr>
//                       <th>ldap</th>
//                       <th>caseid</th>
//                       <th>vertical</th>
//                       <th>awareness</th>
//                       <th>ad recall</th>
//                       <th>consideration</th>
//                       <th>favorability</th>
//                       <th>purchase intent</th>
//                       <th>date</th>
//                   </tr>
//                 </thead>

//                 <tbody id="trackedMV"></tbody>
//               </table>

//             </div>
//           </div>
          
//         </div>
    
//         </div>
//     </div>
//     `;
//     document.body.appendChild(modal);
    
//     // getMVData();
// }

function getNotifications(){
  //   const urlConsulted = `https://script.google.com/a/google.com/macros/s/AKfycbzjhgxDHp_UlzjHnsguxTpt-FOTqPkAPGnFVGJeXUw/dev?action=read&tab=Consulted%20Bucket`;
  //   fetch(urlConsulted)
  //   .then((response) => {
  //       return response.json();
  //   })
  //   .then((data) => {
  //       let consultedCases = data.records;
  //       let userData = data.user;
  //       let myConsultedCases = consultedCases.filter((e) => e.LDAP == userData.ldap);
  //       let consultedData = {
  //           myConsultedCount: myConsultedCases.length,
  //           allConsultedCount: consultedCases.length
  //       };
  //       let settings = JSON.parse(localStorage.getItem('settings'));
        
  //       if (settings.consult_monitoring === true || myConsultedCases.length != 0) {
  //           setNotifications(consultedData);
  //           preConsultedTable(consultedCases);
  //       } else {
  //           console.log('Notifications disabled!');
  //       }

  //       return consultedData;
  //   })
  //   .catch((error) => {
  //     console.error('Error:', error);
  //   });
    
  ///////////////////////////
  chrome.runtime.sendMessage(
      {
          contentScriptQuery: 'consultedBucketQuery'
      },
      data => {
          if (data.response != "error"){
              // console.log(data.records);
              // console.log(Object.entries(data.records).length);
              let consultedCases = data.records;
              let userData = data.user;
              let myConsultedCases = consultedCases.filter((e) => e.LDAP == userData.ldap);
              let consultedData = {
                myConsultedCount: myConsultedCases.length,
                allConsultedCount: consultedCases.length
              };
              let settings = JSON.parse(localStorage.getItem('settings'));
              
              if (settings.consult_monitoring === true || myConsultedCases.length != 0) {
                setNotifications(consultedData);
                preConsultedTable(consultedCases);
              } else {
                console.log('Notifications disabled!');
              }
              
              return consultedData;
            
          } else {
            console.log('Error:', data.response);
            
            
          }
      }
      
  );
}

function preConsultedTable(data){
    document.querySelector('#NICasesTable > thead').innerHTML = `
        <tr>
            <th><b>LDAP</b></th>
            <th><b>Reference ID</b></th>
            <th><b>EWOQ/CASE ID</b></th>
            <th><b>Queue Type</b></th>
            <th><b>Categories</b></th>
        </tr>
    `;
    NICasesTbody.innerHTML = "";
    doCreateNITable(data);
}

function setNotifications(dataObject){
    let myConsultedText = document.querySelector('#myConsultedText'),
        allConsultedText = document.querySelector('#allConsultedText'),
        notifications = JSON.parse(localStorage.getItem('notifications'));
        
    

    if (dataObject){
        myConsultedText ? myConsultedText.textContent = dataObject.myConsultedCount : "";
        allConsultedText ? allConsultedText.textContent = dataObject.allConsultedCount : "";
        //toggle bell ui
        notifications.seen = false;
        localStorage.setItem("notifications",JSON.stringify(notifications));
        checkNotifications();
    }


    console.log(`Consulted cases loaded: ${JSON.stringify(dataObject)}`);
}


function addQMModal(){
  let modal = window.document.createElement('div');
    modal.classList.add('m-modal');
    modal.setAttribute("ID", "QMModal");
  //   <h3 class="center-align card-title">QM Scraper</h3>
  // <h4>Scrape Stats</h4>
  // <ul class="collection" id="QMScrapeStat">
  //     <li class="collection-item">Scraped Cases: <span class="right" style="font-weight: bold" id="scrapedCasesSpan">0</span></li>
  //     <li class="collection-item">Swiss Cases: <span class="right" style="font-weight: bold" id="swissCases">0</span></li>
  //     <li class="collection-item">Rejection Email Cases: <span class="right" style="font-weight: bold" id="rejectionEmailCases">0</span></li>
  //     <li class="collection-item">Missing Study ID: <span class="right" style="font-weight: bold" id="missingStudyID">0</span></li>
  // </ul>
    modal.innerHTML = `
    <div class="m-modal-content">
    <small id="QMVersionText">Beta Version 1.0</small>
        <div class="row" style="">
          <div class="col s12 m4">
            <div class="card">
              <div class="progress hide scrape-loader">
                  <div class="indeterminate"></div>
              </div>
              <div class="card-content" style="padding: 6px 12px">
                

                <div class="row">
                
                  <div class="col s12">
  

                   <table class="striped highlight responsive-table centered">
                    <thead>
                      <tr>
                          <th>LDAP</th>
                          <th>MTD</th>
                          <th>Status</th>
                          <th>Active Cases</td>
                      </tr>
                    </thead>
  
                    <tbody id="QMScrapeStat"></tbody>
                  </table>
                  </div>
                  
                  
                  <div class="col s12 hide" id="QMElevatedInput">
                      <h4 style="margin-top: 12px;">Scrape Configurations</h4>
                      <div class="row">
                          <div class="input-field col s12">
                            <label for="QMQueryToScrape" class="active">Query</label>
                            <input id="QMQueryToScrape" type="text" class="validate" placeholder="assignee:johndoe" value="" required>
                          </div>
                          <div class="input-field col s12">
                            <label for="QMLDAPToScrape" class="active">LDAP</label>
                            <input id="QMLDAPToScrape" type="text" class="validate" placeholder="10" value="me" required>
                          </div>
                      
                          <div class="input-field col s12 m12 l6">
                            <label for="scrapeStartDate" class="active">Start Date</label>
                            <input type="text" id="QMScrapeStartDate" class="datepicker">
                          </div>
                          
                          <div class="input-field col s12 m12 l6">
                              <label for="QMScrapeEndDate" class="active">End Date</label>
                              <input type="text" id="QMScrapeEndDate" class="datepicker">
                          </div>
                          
                          <div class="col s12 hide">
                            <p>
                              <input type="checkbox" id="QMSwissCheckbox" checked/>
                              <label for="QMVersionText">Include Swiss</label>
                            </p>
                          </div>
                          
                          <div class="col s12 hide">
                            <p>
                              <input type="checkbox" id="QMRejectionCheckbox" checked/>
                              <label for="QMRejectionCheckbox">Include Rejection Email</label>
                            </p>
                          </div>
                      </div>
                  </div>
                </div>
              </div>

              <div class="card-action" style="padding: 6px 12px">
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large blue scrape-action-btn" id="QMscrapeBtn">
                  <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>Scrape Cases
                </a>
                
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large blue darken-4 scrape-action-btn" id="QMAssignCasesBtn">
                  <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>Assign Cases
                </a>
                
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large green scrape-action-btn" id="QMsubmitBtn">
                  <i class="material-icons left" style="color: #fff;padding: 0 5px;">send</i>Submit
                </a>
              </div>
            </div>
          </div>
          <div class="col s12 m8">
            <div class="card">
              <div class="progress hide scrape-loader">
                  <div class="indeterminate"></div>
              </div>
              <table class="striped highlight responsive-table centered">
                <thead>
                  <tr>
                      <th>Created Date</th>
                      <th>AR Assign Time</th>
                      <th>LDAP</th>
                      <th>Study ID</th>
                      <th>Case ID</th>
                      <th>Remarks</th>
                      <th>Status</th>
                      <th>Assignee</th>
                  </tr>
                </thead>

                <tbody id="QMScrapedTbody"></tbody>
              </table>

            </div>
          </div>
          
        </div>
    
        </div>
    </div>
    `;
    document.body.appendChild(modal);
}

  // Window Object - State,Data//
  // window.QMData = {};
  
  // CLASSES //
  const QMScrapeLoader = document.querySelectorAll('.scrape-loader'),
      QMActionBtn = document.querySelectorAll('.scrape-action-btn');
  
  // IDs //
  const QMModal = document.querySelector('#QMModal'),
      QMVersionText = document.querySelector('#QMVersionText'),
      QMScrapeStat = document.querySelector('#QMScrapeStat'),
      QMQueryToScrape = document.querySelector('#QMQueryToScrape'),
      QMElevatedInput = document.querySelector('#QMElevatedInput'),
      QMLDAPToScrape = document.querySelector('#QMLDAPToScrape'),
      QMScrapeStartDate = document.querySelector('#QMScrapeStartDate'),
      QMScrapeEndDate = document.querySelector('#QMScrapeEndDate'),
      QMSwissCheckbox = document.querySelector('#QMSwissCheckbox'),
      QMRejectionCheckbox = document.querySelector('#QMRejectionCheckbox'),
      QMscrapeBtn = document.querySelector('#QMscrapeBtn'),
      QMAssignCasesBtn = document.querySelector('#QMAssignCasesBtn'),
      QMsubmitBtn = document.querySelector('#QMsubmitBtn'),
      QMScrapedTbody = document.querySelector('#QMScrapedTbody');
      
  
  let loadPageTimeout,
      QMScrapedArray = [];
      
  const REDBULL_QUERY_URL = `https://cases.connect.corp.google.com/#/queues/bookmark/(state%3Anew%20OR%20state%3Aunassigned%20OR%20state%3Aassigned)%20-(neoenum.opening_channel%3Aphone%20-neoenum.request%3Aincoming_voicemail%20state%3Anew)%20(-has%3Achat%20OR%20is%3Arealtime_ended)%20-(Discard%3ASPAM%20OR%20Discard%3AABANDONED%20OR%20Discard%3AOTHER)%20sort%3Aresolutiontarget%2Ccreated%2Clast_out_comm%2Ccaseid%20(pool%3A%204187%20OR%20pool%3A%205941%20OR%20pool%3A5690)`;
  
  const doRedirect = (query_URL) => {
      const CURRENT_URL = document.location,
          refreshBtn = document.querySelector('material-button[debug-id="refresh"]');
          
      if (CURRENT_URL != REDBULL_QUERY_URL){
          // Redirect to query URL
          document.location = query_URL;
      } else {
          refreshBtn.click();
      }
  
  }
  
  function doScrape(){
      doInitLoad(QMModal);
      
      doRedirect(REDBULL_QUERY_URL);
      
      ///////////////////////////
      chrome.runtime.sendMessage(
          {
              contentScriptQuery: 'QMPrioDumpQuery'
          },
          data => {
              if (data.response != "error"){
                QMData.QMPrio = data.records;
                const caseCount = data.records;
                caseCount.sort((a, b) => a["MTD"] - b["MTD"]);
                const trElement = caseCount.map((tr) => {
                    return `<tr id="${tr.LDAP}" class="${tr.Status == 'SKIP' ? 'hide' : ''}">
                        <td>${tr.LDAP}</td>
                        <td>${tr["MTD"]}</td>
                        <td class="${
                            tr.Status == 'AVAIL'
                            ? 'green lighten-4'
                            : tr.Status == 'CASES' ? 'orange lighten-4' : ''
                        }">${tr.Status}</td>
                        <td>${tr.ActiveCases || 0}</td>
                    </tr>`;
                });
                QMScrapeStat.innerHTML = trElement.join('');
                
                // console.log(QMData)
              } else {
                console.log('Error:', data.response);
              }
          }
      );
      
      
      // Query SPR-AR Cases
      chrome.runtime.sendMessage(
          {
              contentScriptQuery: 'SPRARQuery'
          },
          data => {
              if (data.response != "error"){
                  // console.log(data);
                  let casesArray = data.records;
                  
                //   console.log(casesArray)
                  
                  let finalCasesArray = casesArray.map((caseInstance) => {
                      const {
                          'Case ID': caseID,
                          'Status': caseStatus,
                          'Time Assigned': caseTimeAssigned,
                          'Assigned To': assignedToLDAP
                          
                      } = caseInstance;
                      
                      return {
                          assignedToLDAP,
                          value: [{
                              caseID,
                              caseStatus,
                              caseTimeAssigned
                          }]
                      }
                  });
                  
                  let output = finalCasesArray.filter(item => {
                      return item.value[0].caseStatus != "Completed";
                  })
                  
                // Refactor to not write in DOM
                // Updates Prio Value
                //   if (output.length){
                //       console.log(output)
                //       output.forEach((unfinishedCase) => {
                //          let {assignedToLDAP, value} = unfinishedCase;
                //          let prioTR = document.querySelector(`tr#${assignedToLDAP}`);
                         
                //          if (prioTR){
                //              let [,,analystStatus,activeCaseCount] = prioTR.querySelectorAll('td');
                             
                //              activeCaseCount.textContent = parseInt(activeCaseCount.textContent) + value.length;
                //              if (value.length){
                //                  analystStatus.textContent = "CASES";
                //                  analystStatus.className = "orange lighten-4";
                //              }
                //          }
                //       });
                //   }
                  
                  console.table("Ongoing Cases: ",output);
                  
              } else {
                console.log('Error:', data.response);
              }
          }
      );

      let doAssignCases = () => {
          // TODO
          let rows = Array.from(document.querySelectorAll('#QMScrapedTbody tr'))
          let filteredRowsElement = rows.map(e => {
              return [e.querySelector('td:nth-child(2)'),e.querySelector('td:nth-child(3)'),e.querySelector('td:nth-child(7)')]
          });
          filteredRowsElement = filteredRowsElement.filter(e => e[2].textContent == "New")
          let filteredQMScrapedArray = QMScrapedArray.filter(e => e.caseStatus == "New")
          
          let filteredLDAP = QMData.QMPrio.filter(e => e.Status == 'AVAIL' || e.Status == 'CASES');
          let prioLDAP = [
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP,
                  filteredLDAP
              ].flat()
          console.log("Prio LDAPs: ",filteredLDAP)
          filteredQMScrapedArray.forEach((scrapedCase, i) => {
              let [TDARAssignTime, TDAssignedToLDAP, TDCaseStatus] = filteredRowsElement[i];
              
              if (TDCaseStatus.textContent == "New"){
                  // Modify QMScrapedArray data
                  scrapedCase.ARAssignTime = new Date().toLocaleTimeString();
                  scrapedCase.assignedToLDAP = prioLDAP[i].LDAP;
                  
                  // Modify table data
                  TDARAssignTime.textContent = scrapedCase.ARAssignTime;
                  TDAssignedToLDAP.textContent = scrapedCase.assignedToLDAP;
              }

          });
      };
      
      // Page loader
      loadPageTimeout = setTimeout(() => {
          //Generate Sample CASES
        //   testRenderSampleCases()
          
          
          // Do scraping when loaded
          let caseRow = document.querySelector('comfy-case-row');
            resultBody = caseRow ? caseRow.parentElement : "";
          

            
          setTimeout(() => scrollToBottom(resultBody), 2000);
          setTimeout(() => scrollToBottom(resultBody), 3000);
          setTimeout(() => scrollToBottom(resultBody), 4000);
          
          setTimeout(() => {
              getCases(QMScrapedTbody);
              doInitLoad(QMModal);
                  doAssignCases();
          }, 4500);
          
      }
      ,2000
      ,null);
  }
  
  function doAddQMTable(data){
      
  }
  
  QMAssignCasesBtn.addEventListener('click', (e) => {
      // let rows = Array.from(document.querySelectorAll('#QMScrapedTbody tr'))
      // let filteredRows = rows.map(e => {
      //     return [e.querySelector('td:nth-child(2)'),e.querySelector('td:nth-child(3)')]
      // });
      // console.log(filteredRows);
      // console.log(QMScrapedArray)
      // // TODO
  });
      
  QMscrapeBtn.addEventListener('click', () => {
      doScrape();
      
    //   const recurringScrape = setInterval(() => {
    //       doScrape()
    //   }, 15000);
    // TODO
    // -Check every 3 minutes
    // -Parameters to check:
    //  1. current time [5,6,7,8,35,36,37,38]
    //  2. reset submitted flag at [4,34]
    //  3. changes in data JSON.stringfy + == comparison
    //  4. submitted flag
    // -
       let scrapeIntervalID
       let scrapeFlag = 0
       let isTimeToScrape
       let isSubmitted = false
       let isDataChanged
       let isMaxScrapeInstance = 0
       
       const { previousData } = window.QMObserver
       const timeToscrapeArray = [5,6,7,8,9,10,35,36,37,38,50]
       const timeToResetFlagArray = [4,34]
       
    //   window.QMObserver.isSubmitted = true
       clearInterval(window.QMObserver.superCheckerIntervalID)
           
       const timeChecker = (timesToCheckArray) => {
            let currentMinute = new Date().getMinutes()

            return timesToCheckArray.includes(currentMinute)
       }
       
       const dataChangedChecker = (previous, current) => {
           const previousData = Array.isArray(previous) ? JSON.stringify(previous) : []
           const currentData = Array.isArray(current) ? JSON.stringify(current) : []
           
           return previousData == currentData
       }

       const superChecker = setInterval(() => {
           isTimeToScrape = timeChecker(timeToscrapeArray)
           isTimeToResetSubmittedFlag = timeChecker(timeToResetFlagArray)
           isDataChanged = dataChangedChecker(previousData, QMScrapedArray)
        //   isMaxScrapeInstance = scrapeInstanceChecker(window.QMObserver.redbullCasesCount)
        
           isTimeToResetSubmittedFlag ? window.QMObserver.isSubmitted = false : console.log(window.QMObserver.isSubmitted)
           
           console.log({
               isTimeToScrape,
               isTimeToResetSubmittedFlag,
               isDataChanged,
               QMObserver
           })

           if (isTimeToScrape){
               //Test - Hyper Scrape
               setTimeout(() => doScrape(), 8000);
               setTimeout(() => doScrape(), 16000);
               setTimeout(() => doScrape(), 24000);
               setTimeout(() => {

                   let filteredQMScrapedArray = QMScrapedArray != undefined
                   ? QMScrapedArray.filter(e => e.caseStatus == "New")
                   : []
                   
                   'isSubmitted' in window.QMObserver ? '' : window.QMObserver.isSubmitted = false
                   
                   console.log("filteredArray",filteredQMScrapedArray.length)
                   console.log("Global isSubmitted", window.QMObserver.isSubmitted)
                   if (filteredQMScrapedArray.length && window.QMObserver.isSubmitted == false) {
                       doSubmitQM(filteredQMScrapedArray)
                   }
                   
                //   window.QMObserver.isSubmitted ? console.log('isSubmitted', window.QMObserver.isSubmitted)
                //   : () => {
                //       console.log("filteredArray",filteredQMScrapedArray.length)
                //       if (filteredQMScrapedArray.length != -1) {
                //           console.log(filteredQMScrapedArray.length)
                //           doSubmitQM(filteredQMScrapedArray)
                //       }
                //   }
                   
               }, 30000);
           }
           
       }, 40000)
       
       window.QMObserver.superCheckerIntervalID = superChecker
       let { superCheckerIntervalID } = window.QMObserver
       console.log(superCheckerIntervalID)
    //   doSubmitQM(QMScrapedArray);

  });
  
  // doSubmitQM()
  QMsubmitBtn.addEventListener('click', () =>{
      let filteredQMScrapedArray = QMScrapedArray.filter(e => e.caseStatus == "New");
      doSubmitQM(filteredQMScrapedArray)
    //   doSubmitQM(QMScrapedArray);
      
      // fetch("https://script.google.com/a/macros/google.com/s/AKfycbwey7b36eX2Er8jnJXi04UhW01-U2LONfM_YoOz6LSI/dev?action=read")
      // .then(res => res.json())
      // .then(res => {
      //   console.log(res);
      // });
      
      chrome.runtime.sendMessage(
          {
              contentScriptQuery: 'QMPrioDumpQuery'
          },
          data => {
              if (data.response != "error"){
                console.log(data);
                QMData.QMPrio = data.records;
                
                const caseCount = data.records;
                caseCount.sort((a, b) => a["MTD"] - b["MTD"]);
                const trElement = caseCount.map((tr) => {
                    return `<tr class="${tr.Status == 'SKIP' ? 'hide' : ''}">
                        <td>${tr.LDAP}</td>
                        <td>${tr["MTD"]}</td>
                        <td class="${
                            tr.Status == 'AVAIL'
                            ? 'green lighten-4'
                            : tr.Status == 'CASES' ? 'orange lighten-4' : ''
                        }">${tr.Status}</td>
                        <td>${tr.ActiveCases || 0}</td>
                    </tr>`;
                });
                QMScrapeStat.innerHTML = trElement.join('');
              } else {
                console.log('Error:', data.response);
              }
          }
      );
      
      
      // let recurringScrape = setInterval(() => {
      //     doScrape();
          
      //     chrome.runtime.sendMessage(
      //         {
      //             contentScriptQuery: 'QMPrioDumpQuery'
      //         },
      //         data => {
      //             if (data.response != "error"){
      //               console.log(data);
      //               QMData.QMPrio = data.records;
                    
      //               const caseCount = data.records;
      //               caseCount.sort((a, b) => a.MTD - b.MTD);
      //               const trElement = caseCount.map((tr) => {
      //                   return `<tr class="${tr.Status == 'SKIP' ? 'hide' : ''}">
      //                       <td>${tr.LDAP}</td>
      //                       <td>${tr.MTD}</td>
      //                       <td class="${tr.Status == 'AVAIL' ? 'green lighten-4' : ''}">${tr.Status}</td>
      //                       <td>${tr.ActiveCases || 0}</td>
      //                   </tr>`;
      //               });
      //               QMScrapeStat.innerHTML = trElement.join('');
      //             } else {
      //               console.log('Error:', data.response);
      //             }
      //         }
      //     );
          
      // }, 15000);
      
  });
  
  function doInitLoad(parentModal){
      
      let modalActionBtns = parentModal.querySelectorAll('.scrape-action-btn') || "",
          modalLoader = parentModal.querySelectorAll('.scrape-loader') || "";
          
      modalActionBtns.forEach(actionBtn => {
        actionBtn.classList.toggle('disabled');
      });
      
      modalLoader.forEach(loader => {
        loader.classList.toggle('hide');
      });
    
  }
  
  function doSubmitQM(data){
      window.QMObserver.previousData = data;
      doInitLoad(QMModal);
      console.log("fetching " + new Date().toLocaleTimeString());
      let ldap = document.querySelector('#ldapToScrape').value;
      
      ///////////////////////////
      chrome.runtime.sendMessage(
          {
              contentScriptQuery: 'submitQMQuery',
              postData: data
          },
          data => {
              if (data.response != "error"){
                  // TODO Restructure CT Scraped Table
                  console.log(data);
                  appendDataToTable(QMScrapedTbody,data);
                  if(data[0].status == 200){
                    MSwal.fire("Success!", "Cases has been successfully tracked", "success")
                    doInitLoad(QMModal);
                    
                    
                    window.QMObserver.isSubmitted = true;
                  }
              } else {
                console.log('Error:', data.response);
                
                MSwal.fire({
                  icon: 'error',
                  title: 'Submission failed!',
                  text: 'There seems to be a problem in tracking the case.',
                  footer: `<a target="_blank"
                      href="https://script.google.com/a/google.com/macros/s/AKfycbxzRc1TpiQGRNWZWbbv9XqMJuuPuQgvxO-3ywPZbeY/dev?action=read">Authorize the script</a>`
                });
                doInitLoad(QMModal);
              }
          }
      );
  }
  
  

/////////////////////////////
/////////////////////////////
////////// BLS Scraper ///////
/////////////////////////////
/////////////////////////////
function addMVModal(){
  let modal = window.document.createElement('div');
    modal.classList.add('m-modal');
    modal.setAttribute("ID", "MVModal");
    modal.style.transform = 'none';
    modal.style.width = `75vw`;
    modal.innerHTML = `
    <div class="m-modal-content">
    <small id="versionText">Beta Version 1.9</small>
        <div class="row" style="">
          <div class="col s12 m4">
            <div class="card">
              <div class="progress hide scrapeLoader">
                  <div class="indeterminate"></div>
              </div>
              <div class="card-content" style="padding: 6px 12px">
                <h3 class="center-align card-title">BLS Scraper</h3>

                <div class="row">
                
                  <div class="col s12">
                    <h4>Scrape Stats</h4>
                    <ul class="collection" id="scrapeStat">
                      <li class="collection-item">Scraped Cases: <span class="right" style="font-weight: bold" id="scrapedCasesSpan">0</span></li>
                      <li class="collection-item">Swiss Cases: <span class="right" style="font-weight: bold" id="swissCases">0</span></li>
                      <li class="collection-item">Rejection Email Cases: <span class="right" style="font-weight: bold" id="rejectionEmailCases">0</span></li>
                      <li class="collection-item">Missing Study ID: <span class="right" style="font-weight: bold" id="missingStudyID">0</span></li>
                    </ul>
                  </div>
                  
                  
                  <div class="col s12 hide" id="elevatedInput">
                      <h4 style="margin-top: 12px;">Scrape Configurations</h4>
                      <div class="row">
                          <div class="input-field col s12">
                            <label for="queryToScrape" class="active">Query</label>
                            <input id="queryToScrape" type="text" class="validate" placeholder="assignee:johndoe" value="" required>
                          </div>
                          <div class="input-field col s12">
                            <label for="ldapToScrape" class="active">LDAP</label>
                            <input id="ldapToScrape" type="text" class="validate" placeholder="10" value="me" required>
                          </div>
                      
                          <div class="input-field col s12 m12 l6">
                            <label for="scrapeStartDate" class="active">Start Date</label>
                            <input type="text" id="scrapeStartDate" class="datepicker">
                          </div>
                          
                          <div class="input-field col s12 m12 l6">
                              <label for="scrapeEndDate" class="active">End Date</label>
                              <input type="text" id="scrapeEndDate" class="datepicker">
                          </div>
                          
                          <div class="col s12 hide">
                            <p>
                              <input type="checkbox" id="swissCheckbox" checked/>
                              <label for="swissCheckbox">Include Swiss</label>
                            </p>
                          </div>
                          
                          <div class="col s12 hide">
                            <p>
                              <input type="checkbox" id="rejectionCheckbox" checked/>
                              <label for="rejectionCheckbox">Include Rejection Email</label>
                            </p>
                          </div>
                      </div>
                  </div>
                  
                  
                    
                    
                
                  <div class="input-field col s12 hide">
                    <label for="cid" class="active">Case ID</label>
                    <input id="cid" type="text" class="validate" placeholder="Ex: 5-123456789" required>
                  </div>

                  <div class="input-field col s12 hide">
                    <label for="anal" class="active">Vertical</label>
                    <select class="" id="anal" required>
                      <option  value="" disabled selected>Choose a vertical</option>
                    </select>
                    
                  </div>

                  <div class="input-field col s12 hide">
                    <!-- <input id="mtr" type="text" class="validate"> -->
                    <select multiple id="metricsSelect">
                      <option  value="" disabled selected>Choose a metric</option>
                      <option value="Awareness">Awareness</option>
                      <option value="Ad Recall">Ad Recall</option>
                      <option value="Consideration">Consideration</option>
                      <option value="Favorability">Favorability</option>
                      <option value="Purchase Intent">Purchase Intent</option>
                    </select>
                    <label>Survey Metric</label>

                    <!-- <label for="mtr" class="active">Metrics</label>
                    <div id="mtr" class="chips chips-placeholder chips-autocomplete"></div> -->
                  </div>
                </div>
              </div>

              <div class="card-action" style="padding: 6px 12px">
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large blue hide" id="scrapeBtn">
                  <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>Scrape Cases
                </a>
                
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large blue darken" id="scrapeCustomDateBtn">
                  <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>Scrape Cases
                </a>
                
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large green" id="btn">
                  <i class="material-icons left" style="color: #fff;padding: 0 5px;">send</i>Submit
                </a>
              </div>
            </div>
          </div>
          <div class="col s12 m8">
            <div class="card">
              <div class="progress hide scrapeLoader">
                  <div class="indeterminate"></div>
              </div>
              <table class="striped highlight responsive-table centered">
                <thead>
                  <tr>
                      <th>Date</th>
                      <th>Study ID</th>
                      <th>CASE ID</th>
                      <th>Remarks</th>
                  </tr>
                </thead>

                <tbody id="trackedMV"></tbody>
              </table>

            </div>
          </div>
          
        </div>
    
        </div>
    </div>
    `;
    document.body.appendChild(modal);
    let swissCheckbox = document.querySelector("#swissCheckbox"),
        rejectionCheckbox = document.querySelector("#rejectionCheckbox");
        
    swissCheckbox.addEventListener('click', (e) => e.target.toggleAttribute("checked"));
    rejectionCheckbox.addEventListener('click', (e) => e.target.toggleAttribute("checked"));
    
}

$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 2, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false, // Close upon selecting a date,
    container: "body", // ex. 'body' will append picker to body
    format: 'yyyy-mm-dd'
});

$('.datepicker').on('mousedown',function(event){
    event.preventDefault();
});

let $scrapeStartDate = $('#scrapeStartDate').pickadate(),
    $scrapeEndDate = $('#scrapeEndDate').pickadate();
    
let startPicker = $scrapeStartDate.pickadate('picker'),
    endPicker = $scrapeEndDate.pickadate('picker'),
    yesterdayDate = new Date().toISOString().replace(/T.*/,'').split('-').join('-'),
    todayDate = new Date();
    
startPicker.set('select', yesterdayDate, { format: 'yyyy-mm-dd' });
endPicker.set('select', todayDate, { format: 'yyyy-mm-dd' });

// console.log(scrapeStartDate)
// console.log(scrapeEndDate)

// new Date().toISOString().replace(/T.*/,'').split('-').join('-')

let scrapeBtn = document.querySelector("#scrapeBtn"),
    scrapeCustomDateBtn = document.querySelector("#scrapeCustomDateBtn"),
    scrapeLoader = document.querySelectorAll(".scrapeLoader"),
    versionText = document.querySelector("#versionText"),
    elevatedInput = document.querySelector("#elevatedInput"),
    ldapToScrape = document.querySelector("#ldapToScrape"),
    queryToScrape = document.querySelector("#queryToScrape"),
    scrapedCaseArray,
    timeoutID;
    
function doLoad(){
    
    let scrapeBtn = document.querySelector('#scrapeBtn'),
        scrapeCustomDateBtn = document.querySelector('#scrapeCustomDateBtn'),
        btn = document.querySelector('#btn');
    
    scrapeBtn.classList.toggle('disabled');
    scrapeCustomDateBtn.classList.toggle('disabled');
    btn.classList.toggle('disabled');
    
    scrapeLoader.forEach(loader => {
        loader.classList.toggle('hide');
    });
    
}

// console.log(versionText)

versionText.addEventListener('dblclick', (e) => {
    elevatedInput.classList.remove('hide');
    e.target.classList.add('m-elevated');
});


// Custom Scraper
scrapeCustomDateBtn.addEventListener('click', () => {
    doLoad();
    let startDatePicker = document.querySelector('#scrapeStartDate').value || "",
        endDatePicker = document.querySelector('#scrapeEndDate').value || "",
        queryToScrapeValue = document.querySelector('#queryToScrape').value || "",
        url = `https://cases.connect.corp.google.com/#/queues/org/google_surveys/assignee%3A${ldapToScrape.value}%20created%3E%3D${startDatePicker}%20created%3C${endDatePicker}`;
        
    if (queryToScrapeValue !== ""){
        url = `https://cases.connect.corp.google.com/#/queues/org/google_surveys/${queryToScrapeValue}`;
        document.location = url;
      //   doRedirect(url);
        
    } else {
        doRedirect(REDBULL_QUERY_URL);
    }
    
  //   document.location = url;
    

    
  //   let caseRow = document.querySelector('case-row-v2'),
    let caseRow = document.querySelector('comfy-case-rows'),
        resultBody = caseRow ? caseRow.parentElement : document.querySelector('.results');
    
    setTimeout(() => {
        caseRow = document.querySelector('comfy-case-rows');
        resultBody = caseRow ? caseRow.parentElement : document.querySelector('.results');
    }, 2500);
        
    // console.log(caseRow)
    console.log(navigator.connection.effectiveType)

  //AR - Hyper Scrape
  setTimeout(() => scrollToBottom(resultBody), 2800);
  setTimeout(() => scrollToBottom(resultBody), 3000);
  setTimeout(() => scrollToBottom(resultBody), 4000);
  setTimeout(() => getCases(document.querySelector('#trackedMV')), 5000);
    

});

// Daily Scraper
scrapeBtn.addEventListener('click', () => {
    doLoad();
    let todayFormattedDate = new Date().toISOString().replace(/T.*/,'').split('-').join('-');

    // Old redbull
    // document.location = `https://cases.connect.corp.google.com/#/queues/4185/2/my_last_modified%3A${days}d%20sort%3Amy_last_modified`;
    
    // Updated redbull
    // document.location = `https://cases.connect.corp.google.com/#/queues/all/my_last_modified%3A1d%20sort%3A-my_last_modified%20assignee%3Ame`;
    // https://cases.connect.corp.google.com/#/queues/org/google_surveys/assignee%3Ame%20created%3E%3D2020-08-21
    // document.location = `https://cases.connect.corp.google.com/#/queues/org/google_surveys/assignee%3Ame%20created%3E%3D${todayFormattedDate}`;
    document.location = "https://cases.connect.corp.google.com/#/queues/pool/5690";
    
  //   let caseRow = document.querySelector('case-row-v2');
    let caseRow = document.querySelector('comfy-case-row'),
        resultBody = caseRow ? caseRow.parentElement : "";
        
    setTimeout(() => scrollToBottom(resultBody), 3000);
    setTimeout(() => scrollToBottom(resultBody), 4000);
    setTimeout(() => scrollToBottom(resultBody), 6000);
    setTimeout(() => scrollToBottom(resultBody), 7000);
    setTimeout(() => scrollToBottom(resultBody), 8000);
    
    
    // // regex test
    console.log(resultBody)
    setTimeout(() => getCases(), 8500);
});


function testRenderSampleCases(){
    let casesResultsBody = document.querySelector('.results');
    const SAMPLE_COUNT = "FUCKTHISHIT".split("");
    const SAMPLE_CASE_HTML = `<div buttondecorator="" class="body _ngcontent-vtz-49" debug-id="body" keyboardonlyfocusindicator="" aria-label="Case 3-7719000031358" tabindex="0" role="" aria-disabled="false" > <div class="selection _ngcontent-vtz-49"> <material-checkbox class="themeable _nghost-vtz-41 _ngcontent-vtz-49" debug-id="selection" aria-checked="false" aria-label="Case 3-7719000031358" role="checkbox" tabindex="0" aria-disabled="false" ><div class="icon-container _ngcontent-vtz-41" aria-hidden="true"> <material-icon class="icon _ngcontent-vtz-41 _nghost-vtz-29" ><i aria-hidden="true" class="material-icon-i material-icons-extended _ngcontent-vtz-29" >check_box_outline_blank</i ></material-icon ><material-ripple class="ripple _ngcontent-vtz-41" ></material-ripple> </div><div class="content _ngcontent-vtz-41"></div ></material-checkbox> </div><div class="content _ngcontent-vtz-49"> <div class="importance _ngcontent-vtz-49"> <div class="pill _ngcontent-vtz-49" debug-id="due"> <span class="name _ngcontent-vtz-49">Due:</span> Not configured </div><div class="pill _ngcontent-vtz-49" debug-id="created"> <span class="name _ngcontent-vtz-49">Created:</span> 0 minutes ago </div></div><div class="row _ngcontent-vtz-49"> <div class="cell issue _ngcontent-vtz-49"> <div class="value contact _ngcontent-vtz-49" tooltiptarget=""> <span class="name _ngcontent-vtz-49" debug-id="contact-name" >N/A</span > </div><material-tooltip-text class="_ngcontent-vtz-49 _nghost-vtz-48"> <material-popup enforcespaceconstraints="" ink="" role="tooltip" tracklayoutchanges="" class="aacmtit-ink-tooltip-shadow _ngcontent-vtz-49 _nghost-vtz-13 _ngcontent-vtz-48" > </material-popup></material-tooltip-text > <div class="value summary _ngcontent-vtz-49" debug-id="summary"> (en-GB) Survey review request for product or brand 1010092 | Helpfulness UK Q1 2021 ~ VAS 1 (ID 2558251) </div></div><div class="cell signals _ngcontent-vtz-49"> <div class="names _ngcontent-vtz-49"> <div class="signal-name _ngcontent-vtz-49">Request Type:</div><div class="signal-name _ngcontent-vtz-49">Product:</div></div><div class="values _ngcontent-vtz-49"> <div class="value _ngcontent-vtz-49">Survey Review BrandLift 2</div><div class="value _ngcontent-vtz-49">Brand Lift Surveys</div></div></div><div class="cell status _ngcontent-vtz-49"> <div class="value state _ngcontent-vtz-49" debug-id="state"> New </div><div class="value case-id _ngcontent-vtz-49"> <span buttondecorator="" class="case-id-text _ngcontent-vtz-49" keyboardonlyfocusindicator="" tabindex="0" role="button" aria-disabled="false" >3-7719000031358</span ><material-button animated="true" debug-id="copy-button" icon="" class="_ngcontent-vtz-49 _nghost-vtz-11" aria-label="Copy to clipboard" tabindex="0" role="button" aria-disabled="false" elevation="1" ><div class="content _ngcontent-vtz-11"> <material-icon icon="content_copy" size="x-large" class="_ngcontent-vtz-49 _nghost-vtz-29" ><i aria-hidden="true" class="material-icon-i material-icons-extended _ngcontent-vtz-29" >content_copy</i ></material-icon > </div><material-ripple aria-hidden="true" class="_ngcontent-vtz-11" ></material-ripple></material-button ><material-button animated="true" debug-id="open-button" icon="" class="_ngcontent-vtz-49 _nghost-vtz-11" aria-label="Open in background Cases tab" tabindex="0" role="button" aria-disabled="false" elevation="1" ><div class="content _ngcontent-vtz-11"> <material-icon icon="open_in_new" size="x-large" class="_ngcontent-vtz-49 _nghost-vtz-29" flip="" ><i aria-hidden="true" class="material-icon-i material-icons-extended _ngcontent-vtz-29" >open_in_new</i ></material-icon > </div><material-ripple aria-hidden="true" class="_ngcontent-vtz-11" ></material-ripple ></material-button> </div></div></div></div></div>`;
 
    
    const doEmulateNotEmptyState = () => {
        let resultParentElement = document.querySelector('.panel.results-panel');
        let emptyStateContainer = document.querySelector('.empty-container');
        let newResultsBodyElement = document.createElement('div');
        newResultsBodyElement.className = `results _ngcontent-adn-39`
        
        emptyStateContainer.remove();
        resultParentElement.append(newResultsBodyElement);
        casesResultsBody = document.querySelector('.results')
    }
    
    casesResultsBody == null ? doEmulateNotEmptyState() : '';
    
    const SAMPLE_CASES_ARRAY = SAMPLE_COUNT.map(e => {
        let caseRowElement = document.createElement('comfy-case-row');
        caseRowElement.innerHTML = SAMPLE_CASE_HTML;
        caseRowElement.className = `_ngcontent-tin-39 _nghost-tin-46`
        
        return caseRowElement
    });
        
    // SAMPLE_CASES_ARRAY.forEach(caseRow => casesResultsBody.append(caseRow))
    console.log(SAMPLE_CASES_ARRAY)
    console.log(SAMPLE_CASES_ARRAY.join(','))
    SAMPLE_CASES_ARRAY.forEach(caseRow => casesResultsBody.append(caseRow))
    
    
    
    // return SAMPLE_CASES_ARRAY.map()
}


function getCases(tbodyElement){
    // let casesNode = Array.from(document.querySelectorAll('.status .value.case-id span'));
    // let studyIDNode = Array.from(document.querySelectorAll('div[debug-id="summary"]'));
    // let studyIDNode = Array.from(document.querySelectorAll('.summary-column'));
    
    let data = [],
        redbullCasesCount = document.querySelector('.selection-count').textContent.split(" ")[0] || "",
        swissCheckbox = document.querySelector('#swissCheckbox'),
        rejectionCheckbox = document.querySelector('#rejectionCheckbox'),
        tbody = tbodyElement || "",
        casesNode = redbullCasesCount != 0 ? Array.from(document.querySelector('.results').children) : [];
    
        
    window.QMObserver instanceof Object ? window.QMObserver.redbullCasesCount = redbullCasesCount : ''
        
    let caseDetails = casesNode.map((c) => {
        // Updated redbull
        let lastModifiedDate = c.querySelector('[debug-id="created"]').textContent.split("Created: ")[1],
            caseID = c.querySelector('.case-id-text').textContent,
            studyID = getStudyID(c.querySelector('[debug-id="summary"]').textContent),
            caseStatusDiv = c.querySelector('[debug-id="state"]').textContent,
            caseStatusFirstChild  = c.querySelector('.cell.status').firstElementChild.textContent,
            caseAssigneeDiv = caseStatusFirstChild != "new" ?  caseStatusFirstChild : "";
        
                
        return data.push({
            lastModifiedDate: lastModifiedDate,
            studyID: studyID.id || studyID,
            caseID: caseID,
            caseRemarks: studyID.remark || "",
            caseStatus: caseStatusDiv,
            caseAssignee: caseAssigneeDiv,
            ARAssignTime: "",
            assignedToLDAP: ""
            
        })
    });
    
  //   console.log("cases node: " + casesNode.length)
    if (casesNode.length != redbullCasesCount) {
        getCases(tbody)
        MSwal.fire("Failed!", "<p>There seems to be a problem in scraping cases.</p><p>Please try scraping again.</p>", "error");
    }

  //   console.log(data);
    appendDataToTable(tbody,data);
    
    
    // doSubmitCases(data);
    doLoad();
    scrapedCaseArray = data;
    QMScrapedArray = data;
    return data
}

document.querySelector('#btn').addEventListener('click', () => {doSubmitCases(scrapedCaseArray)});
// document.querySelector('#btn').addEventListener('click', () => {testSubmit(scrapedCaseArray)});


function appendDataToTable(tbody,data){
    // TODO
    // Refactor
    const [firstResponseData] = data;
    
    console.log({data})
    if (typeof firstResponseData !== "undefined" && firstResponseData.message == "OK"){
        console.log({firstResponseData})
      // Reset Table Body Table Data
      // tbody.innerHTML = "";
      // Get first td for every tr
    //   let firstTDArray = Array.from(tbody.querySelectorAll('tr > td:first-child'));
      
      
    //   firstResponseData.responseData.forEach((caseData, index) => {
    //       let newTR = window.document.createElement('tr');
    //       let [lastModifiedDate, studyID, caseID, caseRemarks] = caseData;
    //       firstTDArray[index].textContent = new Date(lastModifiedDate).toLocaleString();

    //   });

    } else if (data){
        tbody.innerHTML = "";
        data.forEach(c => {
            
            let newTR = window.document.createElement('tr'),
                scrapedCasesSpan = document.querySelector("#scrapedCasesSpan"),
                swissCases = document.querySelector("#swissCases"),
                rejectionEmailCases = document.querySelector("#rejectionEmailCases"),
                missingStudyID = document.querySelector("#missingStudyID");
                
            swissCases.textContent = data.filter(c => c.caseRemarks === "swiss").length;
            rejectionEmailCases.textContent = data.filter(c => c.caseRemarks === "rejection email").length;
            missingStudyID.textContent = data.filter(c => c.caseRemarks === "STUDY_ID_NOT_FOUND").length;
            scrapedCasesSpan.textContent = data.length;
            newTR.setAttribute(`id`, `${c.studyID}`);
            
            //Check if Table is QM or Scraper
            if (tbody.id === "trackedMV"){
              //   Date	Study ID	CASE ID	Remarks
                newTR.innerHTML = `
                    <td>${c.lastModifiedDate}</td>
                    <td>${c.studyID}</td>
                    <td>${c.caseID}</td>
                    <td>${c.caseRemarks}</td>
                `;
            } else {
                newTR.innerHTML = `
                    <td>${c.lastModifiedDate}</td>
                    <td></td>
                    <td></td>
                    <td>${c.studyID}</td>
                    <td>${c.caseID}</td>
                    <td>${c.caseRemarks}</td>
                    <td>${c.caseStatus}</td>
                    <td>${c.caseAssignee}</td>
                `;
            }

            // removed from table
          //   <td>
          //       <a class="btn red white-text" style="padding: 0 12px;"><i class="material-icons">delete</i></a>
          //   </td>
            
            tbody.appendChild(newTR);
        });
        
        document.querySelector('#scrapeStat').parentElement.classList.remove('hide');
    }
    
}

function getStudyID(text){
    let bls1 = "Brand study survey",
        bls1Swiss = "Swiss International Air Lines Study",
        bls2Email = "Brandlift2",
        bls2Integ = "Survey review request for product or brand",
        rejection = ["ACTION REQUIRED", "Entity"];
    
    if (text.includes(bls1Swiss)){
        return {
            id: text.split("-")[2].trim(),
            remark: "swiss"
        };
    } else if (text.includes(bls1)){
        return text.split("-")[2].trim()
    } else if (text.includes(bls2Email)){
        // return text.split("(Brandlift2) Survey Campaign")[1].split("-")[0].trim();
        return ""
    } else if (text.includes(bls2Integ)){
        return text.split("(ID ")[1].replace(/\D/g, "");
    } else if (text.includes(rejection[0]) || text.includes(rejection[1])) {
        return {
            id: text.split("(ID ")[1] ? text.split("(ID ")[1].replace(/\D/g, "") : "",
            remark: "rejection email"
        };
    } else {
        return {
            id: "",
            remark: "Study ID not found!"
        };
    }
}

function compareCases(){
    let redbullData = getCases(),
        MVTrackerData;
        
    
    setTimeout(() => console.log(getMVData()), 4000)
}

function scrollToBottomZ(element) {
    // Current Redbull
  //   console.log("element: " + element);
    let resultsDiv = element || document.querySelector('comfy-case-row').parentElement;
    
    resultsDiv.scrollTop = resultsDiv.scrollHeight;
    
    // Updated Redbull
    // let resultsDiv = document.querySelector('.results');
    
    // resultsDiv.scrollTop = resultsDiv.scrollHeight;
  //   console.log("scrolled!" + new Date().toLocaleTimeString())
}

function scrollToBottom(element) {
    // Current Redbull
  //   console.log("element: " + element);
    let resultsDiv = element || document.querySelector('comfy-case-row').parentElement;
    
    resultsDiv.scrollTop = resultsDiv.scrollHeight;
    
    // Updated Redbull
    // let resultsDiv = document.querySelector('.results');
    
    // resultsDiv.scrollTop = resultsDiv.scrollHeight;
    console.log("scrolled!" + new Date().toLocaleTimeString())
}

// function testSubmit(data){
//  let parsed = JSON.stringify(data);
//  let url = `https://script.google.com/a/google.com/macros/s/AKfycbxzRc1TpiQGRNWZWbbv9XqMJuuPuQgvxO-3ywPZbeY/dev?action=insert&data=${parsed}`;
// //   const url = `https://script.google.com/a/google.com/macros/s/AKfycbxzRc1TpiQGRNWZWbbv9XqMJuuPuQgvxO-3ywPZbeY/dev?action=insert&${getParameters()}`;
//   console.log('fetching');
//   fetch(url)
//   .then((resp) => resp.json())
//   .then((data) => {
      
//       MSwal.fire('Success!','Your case has been successfully tracked!','success');
//       return data.response;
//   })
// }

function doSubmitCases(data){
      doLoad();
      console.log("fetching " + new Date().toLocaleTimeString());
      let ldap = document.querySelector('#ldapToScrape').value;
        
            
      ///////////////////////////
      // chrome.runtime.sendMessage(
      //     {
      //         contentScriptQuery: 'submitScrapedCasesQuery'
      //     },
      //     data => {
      //         if (data.response != "error"){
      //             console.log(data);
      //             document.querySelector('#ni-table-loader').classList.toggle('hide');
      //             doCreateNITable(data.records);
      //         } else {
      //           console.log('Error:', data.response);
      //         }
      //     }
      // );
        
        
      // caseValidationTrackerEndpoint
      const url = `https://script.google.com/a/google.com/macros/s/AKfycbxzRc1TpiQGRNWZWbbv9XqMJuuPuQgvxO-3ywPZbeY/dev?ldap=${ldap}`;
      const half = Math.ceil(data.length / 6);
      const firstHalf = data.splice(0, half);
      const secondHalf = data.splice(firstHalf, half);
      const thirdHalf = data.splice(secondHalf, half);
      const fourthHalf = data.splice(thirdHalf, half);
      const fifthHalf = data.splice(fourthHalf, half);
      const lastHalf = data.splice(-half);
      
      chrome.runtime.sendMessage(
          {contentScriptQuery: 'submitScrapedCasesQuery',data: firstHalf, ldap: ldap},
          data => {
              console.log({data})
              if (data.response != "error"){
                  console.log(data);
                  
                  chrome.runtime.sendMessage(
                      {contentScriptQuery: 'submitScrapedCasesQuery',data: secondHalf, ldap: ldap},
                      data => {
                          if (data.response != "error"){
                              console.log(data);
                              
                              chrome.runtime.sendMessage(
                                  {contentScriptQuery: 'submitScrapedCasesQuery',data: thirdHalf, ldap: ldap},
                                  data => {
                                      if (data.response != "error"){
                                          console.log(data);
                                          
                                          chrome.runtime.sendMessage(
                                              {contentScriptQuery: 'submitScrapedCasesQuery',data: fourthHalf, ldap: ldap},
                                              data => {
                                                  if (data.response != "error"){
                                                      console.log(data);
                                                      
                                                      chrome.runtime.sendMessage(
                                                          {contentScriptQuery: 'submitScrapedCasesQuery',data: fifthHalf, ldap: ldap},
                                                          data => {
                                                              if (data.response != "error"){
                                                                  console.log(data);
                                                                  
                                                                  chrome.runtime.sendMessage(
                                                                      {contentScriptQuery: 'submitScrapedCasesQuery',data: lastHalf, ldap: ldap},
                                                                      data => {
                                                                          if (data.response != "error"){
                                                                              // LAST FETCH LETS GO
                                                                              console.log(data);
                                                                              
                                                                              MSwal.fire("Success!", "Cases has been successfully tracked", "success");
                                                                              doLoad();
                                                                              
                                                                          } else console.log('Error:', data.response);
                                                                      }
                                                                  );
                                                                  
                                              
                                                              } else console.log('Error:', data.response);
                                                          }
                                                      );
                                                      
                                                      
                                  
                                                  } else console.log('Error:', data.response);
                                              }
                                          );
                                          
                      
                                      } else console.log('Error:', data.response);
                                  }
                              );
                          } else console.log('Error:', data.response);
                      }
                  );
              } else console.log('Error:', data.response);
          }
      );
      
      
      // fetch(url,{
      //   method: 'POST',
      //   cache: 'no-cache',
      //   redirect: 'follow',
      //   body: JSON.stringify(firstHalf)
      // })
      // .then(res => res.json())
      // .then(res => {
      //       //   Fetch second half
      //       console.log(res);
      //       console.log("first half submitted!")
      //       fetch(url,{
      //           method: 'POST',
      //           cache: 'no-cache',
      //           redirect: 'follow',
      //           body: JSON.stringify(secondHalf)
      //         })
      //         .then(res => res.json())
      //         .then(res => {
      //               console.log(res);
      //               console.log("second half submitted!")
      //               fetch(url,{
      //                   method: 'POST',
      //                   cache: 'no-cache',
      //                   redirect: 'follow',
      //                   body: JSON.stringify(thirdHalf)
      //                 })
      //                 .then(res => res.json())
      //                 .then(res => {
      //                   console.log(res);
      //                   if(res[0].status == 200){
      //                       console.log("third half submitted!")
      //                       MSwal.fire("Success!", "Cases has been successfully tracked", "success")
      //                       doLoad();
      //                   }
      //                 })
      //                 .catch(err => {
      //                   console.log(err);
      //                   console.log("Something Went Wrong");
      //                 });
      //         })
      //         .catch(err => {
      //           console.log(err);
      //           console.log("Something Went Wrong");
      //         });
      // })
      // .catch(err => {
      //   //   add swal for unauthorized
      //   // https://script.google.com/a/google.com/macros/s/AKfycbxzRc1TpiQGRNWZWbbv9XqMJuuPuQgvxO-3ywPZbeY/dev?action=read
        
      //   MSwal.fire({
      //     icon: 'error',
      //     title: 'Submission failed!',
      //     text: 'There seems to be a problem in tracking the case.',
      //     footer: `<a target="_blank"
      //         href="https://script.google.com/a/google.com/macros/s/AKfycbxzRc1TpiQGRNWZWbbv9XqMJuuPuQgvxO-3ywPZbeY/dev?action=read">Authorize the script</a>`
      //   })
        
      //   console.log(err);
      //   console.log("Something Went Wrong");
      // });
  
  
}

function clearAlert() {
  window.clearTimeout(timeoutID);
}

function getMVData(){
    let url = `https://script.google.com/a/google.com/macros/s/AKfycbzfkKd9J2nU8-BI9o97-JQw8z4QI5UmKFznZR7L_pc/dev?`;
    let action = `action=read`;
    let request = url + action;
    let mvData;
    
    
    fetch(request)
    .then(res => res.json())
    .then(data => mvData = data.records);
    
    
    setTimeout(() => console.log(mvData), 4000);
}

function compareData(redbullData, mvData){
    console.log(mvData.records);
    console.log(redbullData);
}

function displayMVTable(data){
    // let jsonData = JSON.stringify(data.records),
    let jsonData = data.records.reverse(),
        MVTbody = document.querySelector('#trackedMV');
    
    
    let jsonSpliced = jsonData.splice(0,99);
    // console.log(JSON.parse(jsonData) + typeof(JSON.parse(jsonData)))
    
    jsonSpliced.forEach(e => {
        let newTR = window.document.createElement('tr');
        
        
        let tdData = Object.values(e);
        console.log(tdData)
        // let tdData = tdObject.split(",");
        // tdData.splice(0,8);
        tdData.forEach(d => {
            
            let newTD = window.document.createElement('td');
            newTD.innerHTML = d;
            
            newTR.appendChild(newTD);
        });
        MVTbody.appendChild(newTR);
    });
    
}

function addBottomModal(){
//   <!-- Modal Trigger -->
//   <a class="waves-effect waves-light btn modal-trigger" href="#bottomModal1">bottomModal1</a>
  let modal = window.document.createElement('div');
    modal.classList.add('m-modal', 'bottom-sheet');
    modal.setAttribute("ID", "bottomModal1");
    modal.style.transform = 'none';
    
    // modal.innerHTML = `
    //     <div class="m-modal-content">
    //         <div class="container front-page valign-wrapper" style="align-items: baseline; justify-content: space-between; margin: 0rem 0.5rem;">
    //             <h2 id="tableTitle" data-id="consulted">Consulted Cases</h2>
    //             <div class="" style="display: flex;">
    //                 <button id="btnTableConsult" class="btn waves-effect waves-light teal darken-4" style="border-radius: 0px;">Consulted</button>
    //                 <button id="btnTableSubmitted" class="btn waves-effect waves-light teal" style="border-radius: 0px;">Submitted</button>
    //             </div>
    //             <button class="waves-effect waves-teal btn-flat" id="getConsultedCasesBtn"><i class="material-icons">refresh</i></button>
    //         </div>
    //             <div class="row">
    //                 <div id="resultTab" class="col s12">
    //                     <div class="progress hide" id="">
    //                         <div class="indeterminate"></div>
    //                     </div>
    //                     <table class="centered bordered highlight" id="NICasesTable" border=1>
    //                         <thead>
                                
    //                         </thead>
    //                         <tbody id="">
    //                         </tbody>
    //                     </table>
    //                 </div>
    //             </div>
        
    //         </div>
    //     </div>
    // `;
    
    // document.body.appendChild(modal);
}

function addTemperModal(){
  let modal = window.document.createElement('div');
    modal.classList.add('m-modal');
    modal.setAttribute("ID", "temperModal");
    modal.style.transform = 'none';
    modal.innerHTML = `
    <div class="m-modal-content">
        <div class="container front-page valign-wrapper" style="align-items: baseline; justify-content: space-between; margin: 0rem 0.5rem;">
            <h2 id="temperHeader">Temper</h2>
            <button class="waves-effect waves-teal btn-flat" id=""><i class="material-icons">refresh</i></button>
        </div>
        <div class="row" style="margin-top: 15px;">
          <div class="col s12 m8 offset-m2">
            <div class="card">
              <div class="card-content" style="height: 600px; width: 100%;">
              </div>
              <div class="card-content hide">
                <span style="font-size: 45px;" class="card-title center">00:00:00</span>
                <div class="row">
                  <div class="input-field col s12">

                    <select id="utilizationSelect">
                      <option value="" selected>Choose your option</option>
                        <option value="AVAIL">AVAIL</option>
                        <option value="CASE">CASE</option>
                        <option value="BREAK">BREAK</option>
                        <option value="LUNCH">LUNCH</option>
                        <option value="BIO">BIO</option>
                        <option value="OTHER REPORTS">OTHER REPORTS</option>
                        <option value="COACHING">COACHING</option>
                        <option value="MEETING">MEETING</option>
                        <option value="ACN - OTHER">ACN - OTHER</option>
                        <option value="MAILBOX">MAILBOX</option>
                        <option value="QA AUDIT">QA AUDIT</option>
                        <option value="HUDDLE">HUDDLE</option>
                        <option value="PKT">PKT</option>
                        <option value="OE">OE</option>
                        <option value="TRAINING">TRAINING</option>
                        <option value="ESCALATION">ESCALATION</option>
                        <option value="QA MONITORING">QA MONITORING</option>
                        <option value="LOGIN">LOGIN</option>
                        <option value="LOGOUT">LOGOUT</option>
                    </select>
                    <label>Materialize Select</label>
                  </div>
                </div>
                
              </div>
              <div class="card-action">
                <a href="#" class="btn blue waves-light waves-effect" id="temperDoClockIn">Clock in</a>
                <a href="#" class="btn blue darken-4 waves-light waves-effect">Clock out</a>
              </div>
            </div>
          </div>
          <div class="col s12 m8 offset-m2">
            <div class="card">
            
              <table class="striped highlight responsive-table centered">
                <thead>
                  <tr>
                      <th>Task</th>
                      <th>Time Started</th>
                      <th>Time End</th>
                      <th>Duration</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Alvin</td>
                    <td>Eclair</td>
                    <td>$0.87</td>
                    <td>$0.87</td>
                  </tr>
                  <tr>
                    <td>Alan</td>
                    <td>Jellybean</td>
                    <td>$3.76</td>
                    <td>$0.87</td>
                  </tr>
                  <tr>
                    <td>Jonathan</td>
                    <td>Lollipop</td>
                    <td>$7.00</td>
                    <td>$0.87</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
          
        </div>
    
        </div>
    </div>
    `;
    document.body.appendChild(modal);
    document.querySelector('#temperDoClockIn').addEventListener('click', (e) => {

        let tempusSource = document.querySelector('#tempusSource'),
            iframeDom = tempusSource.contentDocument || tempusSource.contentWindow.document;
            
        console.log(e.currentTarget);
        console.log(iframeDom);
    });
}

function addModal(){
    let modal = window.document.createElement('div');
    modal.classList.add('m-modal');
    modal.setAttribute("ID", "modal1");
    modal.innerHTML = `
        <div class="m-modal-content">
            <div class="container front-page">
                <div class="row center-align">
                    <p class="logo">
                        <font color="#4285F4">B</font>
                        <font color="#DB4437">L</font>
                        <font color="#F4B400">S</font>
                        <font color="#4285F4">T</font>
                        <font color="#0F9D58">O</font>
                        <font color="#DB4437">O</font>
                        <font color="#4285F4">L</font>
                    </p>
                    <div class="input-field col s8 offset-s2">
                        <input placeholder="01234567" id="inputID" type="text" class="validate center-align">
                    </div>
                    <div class="input-field col s8 offset-s2" style="margin-bottom: 64px">
                        <a class="waves-effect waves-teal btn blue darken-1 white-text " id="resultBtn">Results</a>
                        <a class="waves-effect waves-teal btn blue darken-4 white-text hide" id="manageResultBtn">Manage results</a>
                    </div>
                </div>
            </div>
            <div class="container result-page">
                <div class="row center-align">
                    <div id="resultTab" class="col s12">
                        <div class="progress hide" id="table-loader">
                            <div class="indeterminate"></div>
                        </div>
                        <table class="centered bordered highlight hide" id="table" border=1>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th><b>BLS Tool ID</b></th>
                                    <th><b>Study/ Entity ID</b></th>
                                    <th><b>Title</b></th>
                                    <th><b>Review</b></th>
                                    <th><b>Sub-category</b></th>
                                    <th><b>Response</b></th>
                                    <th><b>Date added</b></th>
                                    <th><b>Editor</b></th>
                                    <th><b>Edit date</b></th>
                                    <th><b>Edit reason</b></th>
                                </tr>
                            </thead>
                            <tbody id="results">
                            </tbody>
                        </table>
                    </div>
                    <div id="manageResultTab" class="col s12 hide">
                        <div class="progress hide" id="table-loader">
                            <div class="indeterminate"></div>
                        </div>
                        <div class="row">
                            <div id="addTab" class="col s12">
                                <div class="row">
                                    <div class="input-field col s12">
                                        <input placeholder="5124666" id="surveyID" type="text" class="validate">
                                        <label class="active" for="surveyID">Survey/Entity ID</label>
                                    </div>
                                    <div class="input-field col s12">
                                        <input placeholder="Product name study" id="surveyTitle" type="text" class="validate">
                                        <label class="active" for="surveyTitle">Survey Title</label>
                                    </div>
                                    <div class="col s12" style="text-align: left;">
                                        <label>Survey Decision</label>
                                        <select id="selectSurveyDecision" class="browser-default">
                                        <option value="GTG">Good to Go(GTG)</option>
                                        <option value="NGTG">Needs Edit(NGTG)</option>
                                        </select>
                                    </div>
                                </div>
                            
                                
                                <form>
                                    <div class="col s12">
                                        <div id="labelsRow" class="row">

                                            <div class="col s6">
                                                <p>
                                                    <input type="checkbox" class="filled-in" id="filled-in-box" checked="checked" />
                                                    <label for="filled-in-box">Filled in</label>
                                                </p>
                                            </div>


                                        </div>
                                    </div>
                                        

                                    <div class="input-field col s12">
                                        <textarea id="textarea1" class="materialize-textarea"></textarea>
                                        <label for="textarea1">Textarea</label>
                                    </div>
                                    
                                    <button class="btn waves-effect waves-light" type="submit" name="action">Submit
                                        <i class="material-icons left">send</i>
                                    </button>
                                </form>
                            </div>
                            <div id="updateTab" class="col s12">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function addTemplateModal(){
    let modal = window.document.createElement('div');
    modal.classList.add('m-modal');
    modal.setAttribute("ID", "templateModal");
    modal.style.transform = 'none';
    modal.innerHTML = `
    <div class="m-modal-content">
        <div class="container front-page valign-wrapper" style="align-items: baseline; justify-content: space-between; margin: 0rem 0.5rem;">
            <h2 id="tableTitle" data-id="consulted">Case Templates</h2>

            <button class="waves-effect waves-teal btn-flat" id="getConsultedCasesBtn"><i class="material-icons">refresh</i></button>
        </div>
            <div class="row">
                <div class="col s12">
                    <div class="progress hide" id="templateTableLoader">
                        <div class="indeterminate"></div>
                    </div>
                    <table class="centered bordered highlight" id="templateTable" border=1>
                        <thead>
                            
                        </thead>
                        <tbody id="templateTbody">
                        </tbody>
                    </table>
                </div>
            </div>
    
        </div>
    </div>
    `;
    document.body.appendChild(modal);
}

function addNIModal(){
    let modal = window.document.createElement('div');
    modal.classList.add('m-modal');
    modal.setAttribute("ID", "nimodal");
    modal.style.transform = 'none';
    modal.innerHTML = `
    <div class="m-modal-content">
        <div class="container front-page valign-wrapper" style="align-items: baseline; justify-content: space-between; margin: 0rem 0.5rem;">
            <h2 id="tableTitle" data-id="consulted">Consulted Cases</h2>
            <div class="" style="display: flex;">
                <button id="btnTableConsult" class="btn waves-effect waves-light teal darken-4" style="border-radius: 0px;">Consulted</button>
                <button id="btnTableSubmitted" class="btn waves-effect waves-light teal" style="border-radius: 0px;">Submitted</button>
            </div>
            <button class="waves-effect waves-teal btn-flat" id="getConsultedCasesBtn"><i class="material-icons">refresh</i></button>
        </div>
            <div class="row">
                <div id="resultTab" class="col s12">
                    <div class="progress hide" id="ni-table-loader">
                        <div class="indeterminate"></div>
                    </div>
                    <table class="centered bordered highlight" id="NICasesTable" border=1>
                        <thead>
                            
                        </thead>
                        <tbody id="NICasesTbody">
                        </tbody>
                    </table>
                </div>
            </div>
    
        </div>
    </div>
    `;
    document.body.appendChild(modal);
}

function getConsultedCases(){
  let NILoader = document.querySelector('#ni-table-loader'),
      tableTitle = document.querySelector('#tableTitle');

  NILoader.classList.toggle('hide');
  let go = tableTitle.dataset.id == "submitted" ? getSubmittedBucket() : getConsultedBucket();
  
  console.log("yow: " + tableTitle.dataset.id);
}

function getTemplateBucket(){
   let templateTbody = document.querySelector("#templateTbody");
   
   
   document.querySelector('#templateTableLoader').classList.toggle('hide');
   
   
    document.querySelector('#templateTable > thead').innerHTML = `
        <tr>
            <th><b>LDAP	</b></th>
            <th><b>EWOQ/CASE ID	</b></th>
            <th><b>Queue Type</b></th>
            <th><b>Tool</b></th>
            <th><b>Language	</b></th>
            <th><b>Country	</b></th>
            <th><b>Times Reviewed	</b></th>
            <th><b>Survey Type	</b></th>
            <th><b>Saved Date	</b></th>
            <th><b>Categories</b></th>
            <th><b>Number of Questions</b></th>
            <th><b>Times Reviewed</b></th>
        </tr>
    `;
    templateTbody.innerHTML = "";
    

  ///////////////////////////
  chrome.runtime.sendMessage(
      {
          contentScriptQuery: 'templatedBucketQuery'
      },
      data => {
          if (data.response != "error"){
              console.log(data);
              document.querySelector('#templateTableLoader').classList.toggle('hide');
              doCreateTemplateTable(data.records);
          } else {
            console.log('Error:', data.response);

            tableTitle = document.querySelector('#tableTitle');
            if (error == "SyntaxError: Unexpected end of JSON input"){
            
                let tr = window.document.createElement('tr');
                    tr.innerHTML = `
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                        <td>No saved template case</td>
                    `;
                if(tableTitle.dataset.id == 'consulted'){
                    templateTbody.innerHTML = "";
                    templateTbody.appendChild(tr);
                }
                document.querySelector('#templateTableLoader').classList.toggle('hide');
                console.log(error);
            } else {
                MSwal.fire("Failed!", "There seems to be a problem in retrieving Template cases.", "error");
                document.querySelector('#templateTableLoader').classList.toggle('hide');
                console.log(error);
            }
        
          }
      }
  );
}

function getConsultedBucket(){
    document.querySelector('#NICasesTable > thead').innerHTML = `
        <tr>
            <th><b>LDAP</b></th>
            <th><b>Reference ID</b></th>
            <th><b>EWOQ/CASE ID</b></th>
            <th><b>Queue Type</b></th>
            <th><b>Categories</b></th>
        </tr>
    `;
    
    let NICasesTbody = document.querySelector('#NICasesTbody');
    
    NICasesTbody.innerHTML = "";
    
  ///////////////////////////
  chrome.runtime.sendMessage(
      {
          contentScriptQuery: 'consultedBucketQuery'
      },
      data => {
          if (data.response != "error"){
              console.log(data);
              document.querySelector('#ni-table-loader').classList.toggle('hide');
              doCreateNITable(data.records);
          } else {
              
              console.log('Error:', data.response);
            
              if (data.response == "error"){
              
                  tableTitle = document.querySelector('#tableTitle');
                  
                  let tr = document.createElement('tr');
                      tr.innerHTML = `
                          <td>No consulted case</td>
                          <td>No consulted case</td>
                          <td>No consulted case</td>
                          <td>No consulted case</td>
                          <td>No consulted case</td>
                      `;
                      
                  if(tableTitle.dataset.id == 'consulted'){
                      NICasesTbody.innerHTML = "";
                      NICasesTbody.appendChild(tr);
                  }
                  

              } else {
              
                  console.error('Error:', data.response);
                  MSwal.fire("Failed!", "There seems to be a problem in retrieving NI cases.", "error");
                  
              }
              
              
              // Toggle NI table loader visibility
              document.querySelector('#ni-table-loader').classList.toggle('hide');
              
              
          }

      }
  );
}

function getSubmittedBucket(){
      document.querySelector('#NICasesTable > thead').innerHTML = `
      <tr>
        <th><b>LDAP</b></th>
      
        <th><b>EWOQ/CASE ID</b></th>
        <th><b>Queue Type</b></th>
        <th><b>Language</b></th>
      
        <th><b>Times Reviewed</b></th>
      
        <th><b>Screenshot/Comments</b></th>
        <th><b>Survey Decision</b></th>
      
        <th><b>Categories</b></th>
        <th><b>AHT</b></th>
      </tr>
      `;
      NICasesTbody.innerHTML = "";
            
      chrome.runtime.sendMessage(
          {
              contentScriptQuery: 'submittedBucketQuery'
          },
          data => {
              if (data.response != "error"){
                  console.log(data);
                  document.querySelector('#ni-table-loader').classList.toggle('hide');
                  doCreateSubmittedTable(data.records);
              } else {
                console.log('Error:', data.response);
                
                
                tableTitle = document.querySelector('#tableTitle');
                if (error == "SyntaxError: Unexpected end of JSON input"){
                
                    let tr = window.document.createElement('tr');
                    tr.innerHTML = `
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                        <td>No submitted case</td>
                    `;
                    NICasesTbody.appendChild(tr);
      
                    
                    document.querySelector('#ni-table-loader').classList.toggle('hide');
                    console.log(error);
                } else {
                    MSwal.fire("Failed!", "There seems to be a problem in retrieving NI cases.", "error");
                    document.querySelector('#ni-table-loader').classList.toggle('hide');
                    console.log(error);
                }
              }
          }
          
      
      );
    
    

    
  //   const urlConsulted = `https://script.google.com/a/google.com/macros/s/AKfycbzjhgxDHp_UlzjHnsguxTpt-FOTqPkAPGnFVGJeXUw/dev?action=read&tab=All%20Cases`;
  //   fetch(urlConsulted)
  //   .then((response) => {
  //       return response.json();
  //   })
  //   .then((data) => {
  //       document.querySelector('#ni-table-loader').classList.toggle('hide');
  //       doCreateSubmittedTable(data.records);
  //   })
  //   .catch(function(error) {
  //       tableTitle = document.querySelector('#tableTitle');
  //       if (error == "SyntaxError: Unexpected end of JSON input"){
        
  //           let tr = window.document.createElement('tr');
  //               tr.innerHTML = `
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //                   <td>No submitted case</td>
  //               `;
  //           NICasesTbody.appendChild(tr);

            
  //           document.querySelector('#ni-table-loader').classList.toggle('hide');
  //           console.log(error);
  //       } else {
  //           MSwal.fire("Failed!", "There seems to be a problem in retrieving NI cases.", "error");
  //           document.querySelector('#ni-table-loader').classList.toggle('hide');
  //           console.log(error);
  //       }
  //   });
}

function doCreateSubmittedTable(data){
    let array = getSubmittedTableArray(data);
    array.reverse();
    NICasesTbody.innerHTML = "";
    array.forEach((row) => {
        let tr = window.document.createElement('tr');
                tr.style.cursor = "pointer";
                tr.setAttribute("data-id", row[1]);
        
        console.log(row);
        row[8] = getFormattedAHT(row[8]);
        row.forEach(cd => {
            let td = window.document.createElement('td');
            td.innerText = cd;
            
            tr.appendChild(td);
        });
        
        NICasesTbody.appendChild(tr);
    });
    
}

function doCreateTemplateTable(data){

    // change this function's thing
    let array = getTemplateTableArray(data),
        templateTbody = document.querySelector('#templateTbody');
        
    array.reverse();
    templateTbody.innerHTML = "";
    array.forEach((row) => {
        let tr = window.document.createElement('tr');
                tr.style.cursor = "pointer";
                tr.setAttribute("data-id", JSON.stringify(row));
        
        row.forEach(cd => {
            let td = window.document.createElement('td');
            td.innerText = cd;
            
            tr.appendChild(td);
        });
        
        templateTbody.appendChild(tr);
    });
    let templateCases = Array.from(document.querySelectorAll('#templateTbody > tr'));
    doAddTemplateListeners(templateCases, data);
}

function doAddTemplateListeners(tr, data){
    tr.forEach(e => {
        e.addEventListener('click', (td) => {
            
            
            
            MSwal.fire({
                icon: "question",
                title: "Are you sure?",
                text: "This will populate your case details.",
                showCancelButton: true,
                confirmButtonText: "Yes, proceed!",
                closeOnConfirm: true,
                reverseButtons: true
            }).then((result) => {
              if (result.value) {
                  
                let caseData = JSON.parse(td.target.parentElement.dataset.id),
                    targetingCategories = document.querySelector('#targeting-chips'),
                    RMTOCheckbox = document.querySelector('#rmto');
                console.log({caseData});

                //set survey type
                document.querySelector(`#targeting-categories [value="${caseData[7]}"]`).selected = true;
                // set queue type
                document.querySelector(`#queue-select [value="${caseData[2]}"]`).selected = true;
                // set number of questions
                document.querySelector(`#numberOfQuestions [value="${caseData[10]}"]`).selected = true;
                //set times reviewed
                document.querySelector(`#timesReviewed [value="${caseData[11]}"]`).selected = true;

                
                // set categories
                // clar datachips
                dataChips = [];
                //add template datachips
                caseData[9].split(',')
                    .map((e) => {
                        return dataChips.push({"tag": e})
                    });
                    
                $('#violations-chip').material_chip({
                    data: dataChips
                });
                // re-add search functionality
                addSearch("violations-chip");
                
                //set country
                countryInput.value = caseData[5];
                
                //set language
                languageInput.value = caseData[4];
                languageInput.dataset.langcode = caseData[4];
                
                //set network type/targeting
                //clear categories
                //removed targeting chips
                // targetingChips = [];
                // caseData[8]
                //     .split(',')
                //     .map(e => {
                //         return targetingChips.push({"tag": e})
                //     });
                // $('#targeting-chips').material_chip({
                //     data: targetingChips
                // });
                
                //set rmto checkbox
                caseData[6] == "yes" ? RMTOCheckbox.checked = true : RMTOCheckbox.checked = false;
                
                // set decision &
                // pending to add decision
                // let settings = JSON.parse(localStorage.getItem('settings'));
                // settings.decision = caseData[10];
                // localStorage.setItem("settings",JSON.stringify(settings));
                

                // switch to finish
                doEnableActions();
                
                // close modal
                $('#templateModal').modal('close');
                
                // toast template used successfully
                Toast.fire({
                  icon: 'success',
                  title: 'Template has been applied successfully!'
                });
                
                
                
              } else if (result.dismiss === Swal.DismissReason.cancel){
                // swalWithBootstrapButtons.fire(
                //   'Cancelled',
                //   'Your imaginary file is safe :)',
                //   'error'
                // )
              }
            })
        });
    });
}




function doCreateNITable(data){


    let array = getNITableArray(data);
    array.reverse();
    NICasesTbody.innerHTML = "";
    array.forEach((row) => {
        let tr = window.document.createElement('tr');
                tr.style.cursor = "pointer";
                tr.setAttribute("data-id", row[1]);
                tr.setAttribute("data-case", JSON.stringify(row));
        
        // console.log("test: " + row);
        row.forEach(cd => {
            let td = window.document.createElement('td');
            td.innerText = cd;
            
            tr.appendChild(td);
        });
        
        NICasesTbody.appendChild(tr);
    });
    
    let NICases = Array.from(document.querySelectorAll('#NICasesTbody > tr'));
    doAddNIListeners(NICases, data);
}

function doAddNIListeners(tr, data){
    tr.forEach(e => {
        e.addEventListener('click', (td) => {
            
            // console.log(JSON.parse())
            
            
            
            MSwal.fire({
                icon: "info",
                title: "Are you sure?",
                text: "This case will be assigned to you",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, proceed!",
                closeOnConfirm: true,
                reverseButtons: true
            }).then((result) => {
              if (result.value) {
                
                //set consulted to CT when assigned
                let caseData = JSON.parse(td.target.parentElement.dataset.case),
                    RMTOCheckbox = document.querySelector('#rmto');
                    
                // set queue type
                document.querySelector(`#queue-select [value="${caseData[3]}"]`).selected = true;
                // set categories
                // clar datachips
                dataChips = [];
                //add template datachips
                caseData[4].split(',')
                    .map((e) => {
                        return dataChips.push({"tag": e})
                    });
                    
                //set rmto
                caseData[4].includes('Review-ReviewedMoreThanOnce') ? RMTOCheckbox.checked = true : RMTOCheckbox.checked = false;
                    
                $('#violations-chip').material_chip({
                    data: dataChips
                });
                // re-add search functionality
                addSearch("violations-chip");


                let caseRef = td.target.parentElement.dataset.id;
                let matchedCase = data;
                let arrayObject = Object.entries(matchedCase);

                let caseFound = arrayObject.filter(e => e[1]["Reference ID"] == caseRef);
                let caseFinal = caseFound.shift();
                let caseFoundObject = caseFinal[1];
                let assigned = {};
                let startTimeFromConsult = new Date(caseFoundObject["Start Time MNL"]);

                // assigned["decision"] = decision;
                assigned["survey_ids"] = caseFoundObject["EWOQ/CASE ID"];
                assigned["start_time"] = getFormattedDate(startTimeFromConsult);
                localStorage.setItem("assigned", JSON.stringify(assigned));
                pushsurvey();
                
                
                  chrome.runtime.sendMessage(
                      {
                          contentScriptQuery: 'consultedCaseAssignedQuery',
                          parameters: caseRef
                      },
                      data => {
                  
                          if (data.response != "error"){
                              
                              console.log(data.message);
                              if (data.message == 'deleted successfully'){
                                  getConsultedBucket();
                                  console.log("table reloaded");
                              }
                  
                          } else {
                              
                              // console.error('Error:', data.response);
                              // MSwal.fire("Failed!", "There seems to be a problem in retrieving NI cases.", "error");
                              // document.querySelector('#ni-table-loader').classList.toggle('hide');
                          }
                      }
                  );
                  
                  
                  

                // close modal
                $('#nimodal').modal('close');
                
              } else if (result.dismiss === Swal.DismissReason.cancel){
                // swalWithBootstrapButtons.fire(
                //   'Cancelled',
                //   'Your imaginary file is safe :)',
                //   'error'
                // )
              }
            })
        });
    });
}

function getSubmittedTableArray(data){
    let array = [],
        objValues = Object.values(data);

    objValues.forEach((e) => {
        array.push([
            e["LDAP"],
            e["EWOQ/CASE ID"],
            e["Queue Type"],
            e["Language"],
            e["Times Reviewed"],
            e["Screenshot/Comments"],
            e["Survey Decision"],
            e["Categories"],
            e["AHT"]
        ]);
    });
    return array;
}

function getNITableArray(data){
    let array = [],
        objValues = Object.values(data);
        
    objValues.forEach((e) => {
        array.push([
            e["LDAP"],
            e["Reference ID"],
            e["EWOQ/CASE ID"],
            e["Queue Type"],
            e["Categories"]
        ]);
    });
    return array;
}

function getTemplateTableArray(data){
    let array = [],
        objValues = Object.values(data);
    objValues.forEach((e) => {
        array.push([
            e["LDAP"],
            e["EWOQ/CASE ID"],
            e["Queue Type"],
            e["Tool"],
            e["Language"],
            e["Country"],
            e["RMTO"],
            e["Survey Type"],
            getFormattedDate(e["Saved Date"]),
            e["Categories"],
            e["Number of Questions"],
            e["Times Reviewed"]
        ]);
    });
    return array;
}

function surveyReviewQueue(){
  clearClass();
  toggleDecisionBtn();
  
  const blsModeValue = JSON.parse(localStorage.settings).bls_mode;
  const customerTypeSelect = document.querySelector('#customer-type'),
      countrySelect = document.querySelector('#country-select'),
      languageInput = document.querySelector('#languageInput'),
      surveyTypeSelect  = document.querySelector('#targeting-categories'),
      targetingDropdown  = document.querySelector('#targeting-dropdown'),
      rmto = document.querySelector('#rmto');
      queueSelect = document.querySelector('#queue-select')
      
      
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed');
      
  
  if (!blsModeValue){
      console.log({blsModeValue})
      numberOfQuestions.parentElement.classList.contains('hide') ? numberOfQuestions.parentElement.classList.remove("hide") : "";
      targetingDropdown.parentElement.classList.remove('hide') ? targetingDropdown.parentElement.classList.remove("hide") : "";
      // timesReviewed.parentElement.classList.contains('hide') ? timesReviewed.parentElement.classList.remove("hide") : "";
    //   countrySelect.parentElement.classList.contains('hide') ? countrySelect.parentElement.classList.remove('hide') : "";
    //   !languageInput.parentElement.classList.contains('hide') ? languageInput.parentElement.classList.add('hide') : "";
  } else {
      console.log(`bls mode value is: ${blsModeValue}`)
  }


  // queueSelect.parentElement.classList.add('s8');
  
//   countrySelect.parentElement.classList.remove('hide');
  
  surveyTypeSelect.parentElement.classList.remove('hide');
  // rmto.parentElement.classList.remove('hide');
  customerTypeSelect.parentElement.classList.add('hide');
  
  
  // show decisions
  const compliantBtn = document.querySelector('#compliant-btn'),
        noncompliantBtn = document.querySelector('#noncompliant-btn'),
        closeBtn = document.querySelector('#close-btn'),
        caseTemplateBtn = document.querySelector('#caseTemplateBtn'),
        enable_actions = document.querySelector('#enable_actions'),
        closeCase = document.querySelector('#closeCase');
  
  compliantBtn.classList.toggle('hide');
  noncompliantBtn.classList.toggle('hide');
  caseTemplateBtn.classList.toggle('hide');
  closeBtn.classList.toggle('hide'); //deleted
  
}

function nonTransactionQueue(){
  clearClass();
  toggleDecisionBtn();

  // Toggle elements
  const customerTypeSelect = document.querySelector('#customer-type'),
    //   surveyStatusSelect = document.querySelector('#surveystatus-select'),
      backBtn = document.querySelector('#enable_actions'),
      rmto = document.querySelector('#rmto'),
      queueSelect = document.querySelector('#queue-select'),
      blsChecker = document.querySelector('#blsChecker'),
      caseTemplateBtn = document.querySelector('#caseTemplateBtn'),
      targetingCategories = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed');
      
      //hide number of times reviewed and number of questions
      numberOfQuestions.parentElement.classList.add('hide');
      timesReviewed.parentElement.classList.add('hide');
      
//   rmto.parentElement.classList.toggle('hide');
//   queueSelect.parentElement.classList.toggle("s8");
//   queueSelect.parentElement.classList.toggle("s12");
  
  // hide targeting categories on Support queue
  targetingCategories.parentElement.classList.add('hide');
  targetingDropdown.parentElement.classList.add('hide');

  backBtn.classList.add('hide');
  blsChecker.parentElement.classList.add('hide');
  caseTemplateBtn.parentElement.classList.add('hide');
  
  
  // show finish & back
  const compliantBtn = document.querySelector('#compliant-btn'),
        noncompliantBtn = document.querySelector('#noncompliant-btn'),
        closeBtn = document.querySelector('#close-btn'),
        enable_actions = document.querySelector('#enable_actions'),
        closeCase = document.querySelector('#closeCase');
  
  enable_actions.classList.toggle('hide');
  closeCase.classList.toggle('hide');
  
}



function supportQueue(){
  clearClass();
  toggleDecisionBtn();

  // Toggle elements
  const customerTypeSelect = document.querySelector('#customer-type'),
      backBtn = document.querySelector('#enable_actions'),
      rmto = document.querySelector('#rmto'),
      queueSelect = document.querySelector('#queue-select'),
      blsChecker = document.querySelector('#blsChecker'),
      caseTemplateBtn = document.querySelector('#caseTemplateBtn'),
      targetingCategories = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      
      gridCountry = document.querySelector('#grid-country'),
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed');
      
//   rmto.parentElement.classList.toggle('hide');
//   queueSelect.parentElement.classList.toggle("s8");
//   queueSelect.parentElement.classList.toggle("s12");

  //hide country
//   gridCountry.classList.contains('hide') ? gridCountry.classList.remove('hide') : "";
  
  // hide targeting categories on Support queue
  targetingCategories.parentElement.classList.add('hide');
  targetingDropdown.parentElement.classList.add('hide');
  backBtn.classList.add('hide');
  blsChecker.parentElement.classList.add('hide');
  caseTemplateBtn.parentElement.classList.add('hide');
  
  
  //hide number of times reviewed and number of questions
  numberOfQuestions.parentElement.classList.add('hide');
  timesReviewed.parentElement.classList.add('hide');
  
  
  
  // show finish & back
  const compliantBtn = document.querySelector('#compliant-btn'),
        noncompliantBtn = document.querySelector('#noncompliant-btn'),
        closeBtn = document.querySelector('#close-btn'),
        enable_actions = document.querySelector('#enable_actions'),
        closeCase = document.querySelector('#closeCase');
  
    enable_actions.classList.toggle('hide');
    closeCase.classList.toggle('hide');
  
}

function publisherQueue(){
  clearClass();
  toggleDecisionBtn();
  
  // Toggle elements
  const customerTypeSelect = document.querySelector('#customer-type'),
      surveyTypeSelect = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      countryInput = document.querySelector('#countryInput'),
      languageInput = document.querySelector('#languageInput'),
      queueSelect = document.querySelector('#queue-select'),
      
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed');
      
      //hide number of times reviewed and number of questions
      numberOfQuestions.parentElement.classList.add('hide');
      timesReviewed.parentElement.classList.add('hide');

      
      
      // fix rmto overflowing
      // queueSelect.parentElement.classList.toggle("s8");

      customerTypeSelect.parentElement.classList.add('hide');
      surveyTypeSelect.parentElement.classList.add('hide');
      targetingDropdown.parentElement.classList.add('hide');
      countryInput.parentElement.classList.add('hide');
      languageInput.parentElement.classList.add('hide');
      
  // show finish & back
  const compliantBtn = document.querySelector('#compliant-btn'),
        noncompliantBtn = document.querySelector('#noncompliant-btn'),
        closeBtn = document.querySelector('#close-btn'),
        enable_actions = document.querySelector('#enable_actions'),
        closeCase = document.querySelector('#closeCase');
  
  enable_actions.classList.toggle('hide');
  closeCase.classList.toggle('hide');

}

function publisherNewQueue(){
  clearClass();
  toggleDecisionBtn();
  
  // Toggle elements
  const customerTypeSelect = document.querySelector('#customer-type'),
    //   surveyStatusSelect = document.querySelector('#surveystatus-select'),
      surveyTypeSelect = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      countryInput = document.querySelector('#countryInput'),
      languageInput = document.querySelector('#languageInput'),
      queueSelect = document.querySelector('#queue-select'),
      
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed');
      
      //hide number of times reviewed and number of questions
      numberOfQuestions.parentElement.classList.add('hide');
      timesReviewed.parentElement.classList.add('hide');
      
      
      
      // fix rmto overflowing
      // queueSelect.parentElement.classList.toggle("s8");

      customerTypeSelect.parentElement.classList.add('hide');
    //   surveyStatusSelect.parentElement.classList.add('hide');
      surveyTypeSelect.parentElement.classList.add('hide');
      targetingDropdown.parentElement.classList.add('hide');
      countryInput.parentElement.classList.add('hide');
      languageInput.parentElement.classList.add('hide');
      
  // show finish & back
  const compliantBtn = document.querySelector('#compliant-btn'),
        noncompliantBtn = document.querySelector('#noncompliant-btn'),
        closeBtn = document.querySelector('#close-btn'),
        enable_actions = document.querySelector('#enable_actions'),
        closeCase = document.querySelector('#closeCase');
  
  enable_actions.classList.toggle('hide');
  closeCase.classList.toggle('hide');

}

function publisherSupportQueue(){
  clearClass();
  toggleDecisionBtn();
  
  // Toggle elements
  const customerTypeSelect = document.querySelector('#customer-type'),
    //   surveyStatusSelect = document.querySelector('#surveystatus-select'),
      surveyTypeSelect = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      countryInput = document.querySelector('#countryInput'),
      languageInput = document.querySelector('#languageInput'),
      queueSelect = document.querySelector('#queue-select'),
      
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed');
      
      //hide number of times reviewed and number of questions
      numberOfQuestions.parentElement.classList.add('hide');
      timesReviewed.parentElement.classList.add('hide');
      
      
      
      // fix rmto overflowing
      // queueSelect.parentElement.classList.toggle("s8");

      customerTypeSelect.parentElement.classList.add('hide');
    //   surveyStatusSelect.parentElement.classList.add('hide');
      surveyTypeSelect.parentElement.classList.add('hide');
      targetingDropdown.parentElement.classList.add('hide');
      countryInput.parentElement.classList.add('hide');
      languageInput.parentElement.classList.add('hide');
      
  // show finish & back
  const compliantBtn = document.querySelector('#compliant-btn'),
        noncompliantBtn = document.querySelector('#noncompliant-btn'),
        closeBtn = document.querySelector('#close-btn'),
        enable_actions = document.querySelector('#enable_actions'),
        closeCase = document.querySelector('#closeCase');
  
  enable_actions.classList.toggle('hide');
  closeCase.classList.toggle('hide');

}

function partnershipQueue(){
  clearClass();
  toggleDecisionBtn();
  
  // Toggle elements
  const customerTypeSelect = document.querySelector('#customer-type'),
    
      countryInput = document.querySelector('#countryInput'),
      surveyTypeSelect  = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      languageInput = document.querySelector('#languageInput'),
      
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed');
  
  
  //hide number of times reviewed and number of questions
  numberOfQuestions.parentElement.classList.add('hide');
  timesReviewed.parentElement.classList.add('hide');



  customerTypeSelect.parentElement.classList.add('hide');
  surveyTypeSelect.parentElement.classList.add('hide');
  targetingDropdown.parentElement.classList.add('hide');
  countryInput.parentElement.classList.add('hide');
  languageInput.parentElement.classList.add('hide');
  
  
  // show finish & back
  const compliantBtn = document.querySelector('#compliant-btn'),
        noncompliantBtn = document.querySelector('#noncompliant-btn'),
        closeBtn = document.querySelector('#close-btn'),
        enable_actions = document.querySelector('#enable_actions'),
        closeCase = document.querySelector('#closeCase');
  
  enable_actions.classList.toggle('hide');
  closeCase.classList.toggle('hide');

}


// Persistent Storage
function pushsurvey() {
//   let refreshInterval = "";
  if(localStorage.getItem("assigned") != null){
      enableButtons();
      initDecisionButtons();
      let raw = JSON.parse(localStorage.getItem("assigned"));
          assigned_survey = raw["survey_ids"],
          start_time = raw["start_time"],
          end_time = raw["end_time"],
          needs_info = raw["needs_info"];

      // Re-assign values
      caseID.value = assigned_survey;


      // Toggle State
      assignSurvey.classList.add("disabled");
      unassignSurvey.classList.toggle("disabled");
      consultBtn.classList.toggle("disabled");
      caseID.disabled = true;

      if (needs_info === true) {

          // needsInfoBtn.classList.toggle("disabled");

          let date = new Date(end_time);
              aht = Math.abs(new Date(date) - new Date(start_time));
              min = Math.floor((aht/1000)/60);
              sec = Math.floor((aht/1000)%60);
          set_aht(min, sec);
          AHT();
      } else {
          let date = new Date(),
              aht = Math.abs(new Date(date) - new Date(start_time)),
              min = Math.floor((aht/1000)/60),
              sec = Math.floor((aht/1000)%60);
          set_aht(min, sec);
          AHT();
          refreshIntervalId = setInterval(AHT, 1000);
          needsInfoBtn.classList.toggle("disabled");
      }
  }
 
}

function surveyDecision(decision){
  if  (!localStorage.assigned){
      console.log('There is assigned survey.');
  } else {
      let data = gatherData(),
      assigned = JSON.parse(localStorage.getItem('assigned'));

      assigned["decision"] = decision;
      localStorage.setItem("assigned", JSON.stringify(assigned));
      
      toggleDecisionBtn();
      // finish & back
      const enable_actions = document.querySelector('#enable_actions'),
            closeCase = document.querySelector('#closeCase');
            
      enable_actions.classList.toggle('hide');
      closeCase.classList.toggle('hide');
  }
}


function toggleDecisionBtn(){
 const compliantBtn = document.querySelector('#compliant-btn'),
  noncompliantBtn = document.querySelector('#noncompliant-btn'),
  closeBtn = document.querySelector('#close-btn'),
  enable_actions = document.querySelector('#enable_actions'),
  closeCase = document.querySelector('#closeCase'),
  blsChecker = document.querySelector('#blsChecker'),
  caseTemplateBtn = document.querySelector('#caseTemplateBtn'),
  blsMode = JSON.parse(localStorage.settings).bls_mode;

  console.log("BLS Mode: " + blsMode);
  
// bls checker stop toggle
//   let blsCheckerToggle = blsMode ? blsChecker.parentElement.classList.toggle('hide') : "Hiding bls checker...";
  
  // reset classes before toggling
  _doClearClass(compliantBtn);
  _doClearClass(noncompliantBtn);
  _doClearClass(closeBtn);
  _doClearClass(enable_actions);
  _doClearClass(closeCase);
  _doClearClass(caseTemplateBtn);
  
  
  // decisions
  compliantBtn.classList.toggle('hide');
  noncompliantBtn.classList.toggle('hide');
  closeBtn.classList.toggle('hide'); //deleted
  caseTemplateBtn.classList.toggle('hide');
  
  // finish & back
  enable_actions.classList.toggle('hide');
  closeCase.classList.toggle('hide');
}

function queueToggle(queueSelected){
  console.log('Selected: ' + queueSelected);
  if (queueSelected == "Survey Review") {
      surveyReviewQueue();
  } else if(queueSelected == "Support") {
      supportQueue();
  } else if(queueSelected == "Publisher") {
      publisherQueue();
  } else if(queueSelected == "Publisher-New") {
    publisherNewQueue();
  }else if(queueSelected == "Publisher-Support") {
    publisherSupportQueue();
  } else if(queueSelected == "Partnership"){
      partnershipQueue();
  } else if(queueSelected == "NonTransaction"){
      nonTransactionQueue();
  } else {
      console.log('Invalid queue: ' + queueSelected);
  }
}
  
// Test Fetch
function doFetch() {
    const getRandomNumber = (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    // const caseData = getParameters();
    const caseData = getCaseData();
    const delay = getRandomNumber(1000,5000);
    const bucketNumber = getRandomNumber(1,3);
    console.log(bucketNumber);
    
    const submitDelayID = setTimeout(() => {
        console.log('delayed',delay)
        
          chrome.runtime.sendMessage(
              {
                  contentScriptQuery: 'finishedCaseQuery',
                  caseData: caseData,
                //   caseData: encodeURIComponent(caseData),
                  bucketNumber: bucketNumber
              },
              data => {
                  if (data.response != "error"){
                      console.log({data});
                      MSwal.fire('Success!','Your case has been successfully tracked!','success');
                      return data.response;
                  } else {
                    MSwal.fire({
                      icon: 'error',
                      title: 'Submission failed!',
                      text: 'There seems to be a problem in tracking the case.',
                      footer: `<a target="_blank"
                          href="https://docs.google.com/document/d/1yJZQ5uSRothZ6exssmGzNkNwN7YRU0c59fPYa4w2j_M/edit#heading=h.dh656h8cb61b">How do I proceed?</a>`
                    })
                    console.log(data);
                  }
        
              }
          );
        
    }, delay);


    


}

function initDarkMode(){
  let settings = JSON.parse(localStorage.getItem('settings')),
      card1 = document.querySelector('#card-1'),
      card2 = document.querySelector('#card-2'),
      settingsDropdown = document.querySelector('#settings-dropdown'),
      notificationsDropdown = document.querySelector('#notifications-dropdown'),
      cardNav = document.querySelector('#card-nav'),
      darkModeSwitch = document.querySelector('#darkModeSwitch > label > input[type=checkbox]'),
      nimodal = document.querySelector('#nimodal > .m-modal-content'),
      caseID = document.querySelector('#caseID'),
      violationsChip = document.querySelector('#violations-chip > input'),
      languageInput = document.querySelector('#languageInput'),
      countryInput = document.querySelector('#countryInput'),
      screenshotText = document.querySelector('#screenshot-text'),
      targetingCategories = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      queueSelectCategories = document.querySelector('#queue-select');

  darkModeSwitch.toggleAttribute("checked");
  
// placeholder color on dark mode
    caseID.classList.toggle("d-mode-placeholder");
    violationsChip.classList.toggle("d-mode-placeholder");
    countryInput.classList.toggle("d-mode-placeholder");
    languageInput.classList.toggle("d-mode-placeholder");
    screenshotText.classList.toggle("d-mode-placeholder");
    
// select * options background, text color
targetingCategories.classList.toggle("d-mode-options");
targetingDropdown.classList.toggle("d-mode-options");
queueSelectCategories.classList.toggle("d-mode-options");
    
  nimodal.classList.toggle('card-d-mode');

  card1.classList.toggle('card-d-mode');
  card2.classList.toggle('card-d-mode');
  settingsDropdown.classList.toggle('card-d-mode');
  cardNav.classList.toggle('nav-d-mode');
}

function toggleDarkMode(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  initDarkMode();
  if (settings.dark_mode === true){
      settings.dark_mode = false;
      localStorage.setItem("settings",JSON.stringify(settings));
  } else if (settings.dark_mode === false) {
      settings.dark_mode = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }
}

// show NI
function initNI(){
    let settings = JSON.parse(localStorage.getItem('settings')),
      needsInfoBtn = document.querySelector('#needsInfoBtn'),
      viewNICheckbox = document.querySelector('#showNI > label > input[type=checkbox]');
    
    needsInfoBtn.parentElement.classList.toggle('hide');
      
    // toggle change position switch
    viewNICheckbox.toggleAttribute("checked");
}

function toggleNI(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  initNI();
  if (settings.show_NI === true){
      settings.show_NI = false;
      localStorage.setItem("settings",JSON.stringify(settings));
  } else if (settings.show_NI === false) {
      settings.show_NI = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }
}


// show M/V
function initMV(){
    let settings = JSON.parse(localStorage.getItem('settings')),
      viewMVBtn = document.querySelector('#viewMV'),
      viewMVCheckbox = document.querySelector('#showMV > label > input[type=checkbox]');
    
    viewMVBtn.parentElement.classList.toggle('hide');
      
    // toggle change position switch
    viewMVCheckbox.toggleAttribute("checked");
}

function toggleMV(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  initMV();
  if (settings.show_MV === true){
      settings.show_MV = false;
      localStorage.setItem("settings",JSON.stringify(settings));
  } else if (settings.show_MV === false) {
      settings.show_MV = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }
}

// showTemper

function initTemper(){
  let settings = JSON.parse(localStorage.getItem('settings')),
      viewTemperBtn = document.querySelector('#viewTemper'),
      viewTemperCheckbox = document.querySelector('#showTemper > label > input[type=checkbox]');
  
  viewTemperBtn.parentElement.classList.toggle('hide');
      
  // toggle change position switch
  viewTemperCheckbox.toggleAttribute("checked");
}

function toggleTemper(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  initTemper();
  if (settings.show_temper === true){
      settings.show_temper = false;
      localStorage.setItem("settings",JSON.stringify(settings));
  } else if (settings.show_temper === false) {
      settings.show_temper = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }
}

function initPosition(){
  let settings = JSON.parse(localStorage.getItem('settings')),
      fab = document.querySelector('.fixed-action-btn'),
      trackerUL = document.querySelector('#trackerUL'),
      changePosition = document.querySelector('#changePosition > label > input[type=checkbox]');
  
  fab.classList.toggle('fab-change-pos');
  trackerUL.classList.toggle('card-change-pos');
      
  // toggle change position switch
  changePosition.toggleAttribute("checked");
}

function togglePosition(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  initPosition();
  if (settings.change_position === true){
      settings.change_position = false;
      localStorage.setItem("settings",JSON.stringify(settings));
  } else if (settings.change_position === false) {
      settings.change_position = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }
}


function initBLSMode(){
  let countryInput = document.querySelector('#countryInput'),
      languageInput = document.querySelector('#languageInput'),
      queueSelect = document.querySelector('#queue-select'),
      targetingCategories = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      blsSwitch = document.querySelector('#blsModeSwitch > label > input[type=checkbox]'),
      rmto = document.querySelector('#rmto'),
      viewMV = document.querySelector('#viewMV'),
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed'),
      blsChecker = document.querySelector('#blsChecker');
      
  blsSwitch.toggleAttribute("checked");
//   blsChecker.parentElement.classList.toggle('hide');

//   queueSelect.parentElement.classList.toggle('s8');
//   queueSelect.parentElement.classList.toggle('s12');
//   rmto.parentElement.classList.toggle('hide');

// countryInput.parentElement.classList.toggle('hide');
//   numberOfQuestions.parentElement.classList.toggle('hide');
//   timesReviewed.parentElement.classList.toggle('hide');
targetingDropdown.classList.toggle('hide');
  
  numberOfQuestions.parentElement.classList.contains('hide') ? numberOfQuestions.parentElement.classList.remove('hide') : numberOfQuestions.parentElement.classList.add('hide');
  timesReviewed.parentElement.classList.contains('s12') ? timesReviewed.parentElement.classList.add('s6') : timesReviewed.parentElement.classList.add('s12');
  languageInput.parentElement.classList.contains('hide') ? languageInput.parentElement.classList.remove('hide') : languageInput.parentElement.classList.add('hide');
  
  viewMV.parentElement.classList.toggle('hide');
  Array.from(document.querySelectorAll('.toggleable')).forEach((e) => {
      e.classList.toggle('hide');
  });
}

function toggleBLSMode(){
  // toggle core to bls
  let settings = JSON.parse(localStorage.getItem('settings'));
  initBLSMode();

  var status = $(this).prop('checked');
  console.log(status);

  if (settings.bls_mode === true){
      settings.bls_mode = false;
      localStorage.setItem("settings",JSON.stringify(settings));

  } else if (settings.bls_mode === false) {
      settings.bls_mode = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }

}

//   consultMonitoring
function initConsultMonitoring(settings){

let consultMonitoring = document.querySelector('#consultMonitoring > label > input[type=checkbox]');
    
    
consultMonitoring.toggleAttribute("checked");
console.log("Consult monitoring initiate...")
}

function toggleConsultMonitoring(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  initConsultMonitoring();

  var status = $(this).prop('checked');
  console.log(status);

  if (settings.consult_monitoring === true){
      settings.consult_monitoring = false;
      localStorage.setItem("settings",JSON.stringify(settings));

  } else if (settings.consult_monitoring === false) {
      settings.consult_monitoring = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }
}


function initAlarm(settings){

let caseTypeQueue = document.querySelector('#queue-select');
    selectedQueue = caseTypeQueue.options[caseTypeQueue.selectedIndex].value,
    caseReminder = document.querySelector('#caseReminder > label > input[type=checkbox]');
    
    
caseReminder.toggleAttribute("checked");
console.log("Alarm initiate...")
}

function toggleCaseAlarm(){
  // toggle core to bls
  let settings = JSON.parse(localStorage.getItem('settings')),
      caseReminder = settings.case_reminder;

  var status = $(this).prop('checked');
  console.log(status);

  if (settings.case_reminder === true){
      settings.case_reminder = false;
      localStorage.setItem("settings",JSON.stringify(settings));

  } else if (settings.case_reminder === false) {
      settings.case_reminder = true;
      localStorage.setItem("settings",JSON.stringify(settings));
  }
  console.log("Alarm toggled: " + caseReminder);
  initAlarm(caseReminder);

}

function setSwalByTime(duration){
  if (duration){
      clearTimeout(alarmTimerID);
      console.log("cleared: " + alarmTimerID);
      
     let durationInMinutes = (duration * 60) * 1000;
     
     return alarmTimerID = setTimeout(() => {
        //  swal("Case Reminder", "Case is already past the threshold time. Please consider consulting the case.", "info")
        MSwal.fire({
          icon: 'info',
          title: 'Case Reminder',
          showClass: {
              backdrop: 'swal2-backdrop-show alert-on'
          },
          html: `<p>Case is already past the threshold time.</p>
                <p>Please consider
                    <a target="_blank" style="font-size: 18px" href="https://script.google.com/a/google.com/macros/s/AKfycbwBA-B6Tr1o2RUaD2ZOwc-GDRDYnnE39kWwDYkSaNWTl7R4250b/exec">consulting the case.</a>
                </p>`,
                
          padding: '1.5em',
          backdrop: `rgba(244, 67, 54,0.4)`
        });
        
    },
    durationInMinutes
    );
  }
}

function doAssign(){
  refreshInterval = setInterval(AHT, 1000),
  nmin = 0,
  nsec = 0,
  nhour = 0;
  
  let settings = JSON.parse(localStorage.settings);
  let {
      case_reminder: caseReminder,
      bls_mode: BLSMode,
  } = settings;

  let startDate = getFormattedDate();
  let caseIDInput = document.querySelector('#caseID');
  let caseID = Array.from(caseIDInput.value.split(","));
  let stringifyCaseID = `'${caseID.toString()}`;
  
  let preselectedCaseID = BLSMode === true ? caseID : stringifyCaseID;
  console.log(BLSMode, preselectedCaseID)
  

  let [ cid ] = caseID;
  let caseStatus = "Processing";
  
  // let enableCaseAlarm = JSON.parse(settings).case_reminder;
  

  if (!localStorage.assigned){
    localStorage.setItem("assigned",JSON.stringify({
        "refreshInterval": refreshInterval,
        "survey_ids": preselectedCaseID,
        "start_time": startDate
      }));
    } else {
      console.log('There is assigned survey.');
  }
  
  // console.log(JSON.parse(settings));
  
  Toast.fire({
    icon: 'success',
    title: 'Case has been assigned successfully!'
  });
  
  toggleCards();
  disableButtons();
  enableButtons();
  initDecisionButtons();
  
  if (caseReminder === true){
    getCurrentQueue();
  } else {
      console.log("Alarm is set to: " + caseReminder);
  }
  
  if (BLSMode === true){
      
      changeCaseState(cid,caseStatus);
      
  } else {
      console.log("BLS mode is set to: " + BLSMode);
  }
  
}

function changeCaseState(caseID,caseStatus){
  
  chrome.runtime.sendMessage(
      {
          contentScriptQuery: 'changeCaseStatesSPRQuery',
          parameters: {
              caseID,
              status: caseStatus
          }
      },
      data => {
  
          if (data.response != "error"){
              console.log(data.response);
              Toast.fire({
                icon: 'success',
                title: 'Case status been changed successfully!'
              });
              return data.response;
  
          } else {
              // TODO
                  
              Toast.fire({
                icon: 'error',
                title: 'Error in changing case status'
              });
            console.log(error);
            
          }
      }
  );
}

function getCurrentQueue(){
  const queueSelect = document.querySelector('#queue-select');
  const queueValue = queueSelect ? queueSelect.value : "";

  if (queueValue == "Survey Review"){
      setSwalByTime(5);
  } else if (queueValue == "Support"){
      setSwalByTime(15);
  } else if (queueValue == "Publisher-New"){
      setSwalByTime(5);
  } else if (queueValue == "Publisher-Support"){
      setSwalByTime(20);
  } else if (queueValue == "Publisher"){
      setSwalByTime(20);
  } else {
      console.log("Queue found: " + queueValue)
  }
}

function doFinish(){
    const caseIDInput = document.querySelector('#caseID');
    const aht = document.querySelector('#aht');
    const { assigned, settings } = localStorage;
    const { refreshInterval, survey_ids: [ caseID ] } = JSON.parse(assigned);
    const { case_reminder: caseReminder, bls_mode: BLSMode } = JSON.parse(settings);
    const caseStatus = 'Completed';
        
        
    aht.textContent = "00:00:00";
    caseIDInput.value = "";
      
    if (refreshInterval){
        clearInterval(refreshInterval);
    }
    
    clearTimeout(alarmTimerID);
              
    localStorage.removeItem("assigned");
    needsInfoBtn.classList.toggle('disabled', false);
    disableButtons();
    toggleCards();
    clearCardValues();
    enableButtons();
    toggleDecisionBtn();
  
  
    //QM - Status changes
    BLSMode ? changeCaseState(caseID,caseStatus) : console.log("BLS mode is set to: " + BLSMode)
  
}

function doUnassign(){
  let caseIDInput = document.querySelector('#caseID'),
      aht = document.querySelector('#aht'),
      refreshInterval = JSON.parse(localStorage.assigned).refreshInterval || "";
      
  Toast.fire({
    icon: 'success',
    title: 'Case has been unassigned successfully!'
  });
  
  
  clearTimeout(alarmTimerID);
  
  clearCardValues();
  needsInfoBtn.classList.remove('disabled');
  surveyReviewQueue();
  disableButtons();
  enableButtons();
  refreshInterval != "" ? clearInterval(refreshInterval) : "";
  
  aht.textContent = "00:00:00";
  caseIDInput.value = "";
  localStorage.removeItem("assigned");
}

function doEnableActions(){
console.log('enabled!');
    
toggleDecisionBtn();

// show decisions
const compliantBtn = document.querySelector('#compliant-btn'),
      noncompliantBtn = document.querySelector('#noncompliant-btn'),
      closeBtn = document.querySelector('#close-btn'),
      caseTemplateBtn = document.querySelector('#caseTemplateBtn');

caseTemplateBtn.classList.toggle('hide');
compliantBtn.classList.toggle('hide');
noncompliantBtn.classList.toggle('hide');
closeBtn.classList.toggle('hide'); //deleted
    
}

function doSaveTemplate(){
  //Assign data to LS
  preFinish();
  
  console.log("save template init...");
  console.log(getParameters())
  MSwal.showLoading();
  
  
  chrome.runtime.sendMessage(
      {
          contentScriptQuery: 'saveTemplateQuery',
          parameters: getParameters()
      },
      data => {
  
          if (data.response != "error"){
              
              let saveBtn = document.querySelector('#saveTemplateBtn');
              saveBtn.textContent = 'Template Saved!';
              saveBtn.style.cssText = "cursor: default; pointer-events: none; color: #333333bf;";
              MSwal.hideLoading();
              return data.response;
  
          } else {
              
            MSwal.fire({
              icon: 'error',
              title: 'Submission failed!',
              text: 'There seems to be a problem in tracking the template.',
              footer: `<a target="_blank"
                  href="https://script.google.com/a/google.com/macros/s/AKfycbw6tEzDQXsxVzmGOSNnfL9yZrCSJKxSLNxq7QriThKh/dev?action=insert&tab=Template%20Bucket">Authorize this script.</a>`
            })
            console.log(error);
            
          }
      }
  );
                  
}

function doConsult(){
  console.log("consult clicked");

  // Set Case Data
  //set consult based on queue
  const currentQueue = document.querySelector('#queue-select');
  currentQueue.value == "Survey Review" ? dataChips.push({tag: "Review-Consult"}) : dataChips.push({tag: "Support-Consult"});
  $('#violations-chip').material_chip({data: dataChips});
  addSearch("violations-chip");
  // assign data to LS
  preFinish();

  // Fetch Case Data
  getParameters();
  
  chrome.runtime.sendMessage(
      {
          contentScriptQuery: 'consultCaseQuery',
          parameters: getParameters()
      },
      data => {

          if (data.response != "error"){
              
              getNotifications();
              
              MSwal.fire("Success!", "Case has been added to Consulted Bucket", "success");
              
              return data.response;
 
          } else {
              
              console.error('Error:', data.response);
              MSwal.fire("Failed!", "There seems to be a problem in retrieving NI cases.", "error");
              document.querySelector('#ni-table-loader').classList.toggle('hide');
          }
      }
  );

  // const url = `https://script.google.com/a/google.com/macros/s/AKfycbzjhgxDHp_UlzjHnsguxTpt-FOTqPkAPGnFVGJeXUw/dev?action=insert&tab=Consulted%20Bucket&${getParameters()}`;
  // console.log('fetching');
  // fetch(url)
  // .then((resp) => resp.json())
  // .then(function (data){
      
      // getNotifications();
      
      // MSwal.fire("Success!", "Case has been added to Consulted Bucket", "success");
      
      // return data.response;
  // })
  // .catch(function(error) {
  //   MSwal.fire("Failed!", "There seems to be a problem in tracking the case.", "error");
  //   console.log(error);
  // });
  
  
  

  // // Reset Case Data
  doUnassign();
}

function doClearConsult(){
  let caseIDInput = document.querySelector('#caseID'),
      aht = document.querySelector('#aht');
      aht.textContent = "00:00:00";
      caseIDInput.value = "";
      localStorage.removeItem("assigned");
      needsInfoBtn.classList.toggle('disabled', false);

  disableButtons();
  clearInterval(refreshInterval);
  clearCardValues();
}

function doNeedsInfo(){
  let assigned = JSON.parse(localStorage.getItem('assigned')),
      aht = Math.abs(new Date() - new Date(assigned["start_time"])),
      needsInfoBtn = document.querySelector('#needsInfoBtn');
  
  needsInfoBtn.classList.toggle('disabled');
  assigned["needs_info"] = true;
  assigned["end_time"] = getFormattedDate();
  assigned["aht"] = aht;
  localStorage.setItem("assigned", JSON.stringify(assigned));

  dataChips.push({tag: "Review-NeedsInfo"})
  $('#violations-chip').material_chip({
      data: dataChips
  });
  addSearch("violations-chip");
  clearInterval(refreshInterval);
}



////////////////////////////////////
////////////////////////////////////
// Utilities and Helper Functions///
////////////////////////////////////
////////////////////////////////////

function gatherData() {
console.log('Gathering data');
// queueSelect.options[queueSelect.selectedIndex].value
var data_chips= $('#violations-chip').material_chip('data'),
    categoryString = "";
for(var i = 0; i < dataChips.length; i++) {
    categoryString += `${dataChips[i].tag}, `;
}
let dataChipsTag = dataChips.map(e => e.tag);
categoryString = encodeURIComponent(dataChipsTag.join());

//multiple-chip based selection
// let targeting_data = $('#targeting-chips').material_chip('data'),
//     targetingString = "";
// targeting_data.forEach((chip) => {
//     targetingString += chip.tag + ',';
// });
// targetingString = targetingString.replace(/,\s*$/, "");

let queueSelect = document.querySelector('#queue-select'),
    countryInput = document.querySelector('#countryInput'),
    languageInput = document.querySelector('#languageInput'),
    rmto = document.querySelector('#rmto'),
    targetingCategories = document.querySelector('#targeting-categories'),
    targetingDropdown = document.querySelector('#targeting-dropdown'),
    screenshotText = document.querySelector('#screenshot-text'),
    numberOfQuestionsSelect = document.querySelector('#numberOfQuestions'),
    timesReviewedSelect = document.querySelector('#timesReviewed');
    
const blsModeValue = JSON.parse(localStorage.settings).bls_mode;
    
    
//old error handler
// checkValidInput(languageInput.dataset.langcode, languageInput);

//new error handler
checkValidSelect(targetingCategories);
blsModeValue ? checkValidSelect(languageInput) : "";
// blsModeValue ? "" : checkValidSelect(countryInput);
blsModeValue ? "" : checkValidSelect(numberOfQuestionsSelect);
blsModeValue ? checkValidSelect(timesReviewedSelect) : "";
blsModeValue || targetingDropdown.hasAttribute('disabled') 
    ? "" 
    : checkValidSelect(targetingDropdown);

console.log('language', languageInput.dataset.langcode, languageInput.dataset.langcode == undefined)

let caseData = {
    queue: queueSelect.options[queueSelect.selectedIndex].value,
    violations: categoryString,
    country: countryInput.value,
    language: languageInput.dataset.langcode != undefined ? languageInput.dataset.langcode : '',
    RMTO: rmto.checked? "yes" : "no",
    surveyType: targetingCategories.value,
    targeting: targetingDropdown.value,
    numberOfQuestions: numberOfQuestionsSelect.options[numberOfQuestionsSelect.selectedIndex].value,
    timesReviewed: timesReviewedSelect.options[timesReviewedSelect.selectedIndex].value,
    screenshotText: screenshotText.value
};



console.log(caseData);
return caseData;
}

function checkValidInput(inputData, inputElement){

if (!inputElement.dataset.langcode) {
    
    console.log("invalid: " + inputElement.dataset.langcode);
    
    inputElement.setCustomValidity("This field is required");
    
    inputElement.classList.add("invalid", "invalid-placeholder");
    inputElement.setAttribute("placeholder", "This field is required.");
    closeCase.classList.add("disabled");
    
    
    inputElement.addEventListener('input', (e) => {
        if (!e.target.dataset.langcode){
            e.target.classList.remove("invalid", "invalid-placeholder");
            e.target.setAttribute("placeholder", "English");
            closeCase.classList.remove("disabled");
        } else {
            console.log(`${e.target}: ${e.target.value}: ${e.target.textContent}`)
        }
    });
}

console.log(inputElement.dataset.langcode);

console.log(`${inputElement} is not empty`);
}

function checkValidSelect(selectElement){
if (selectElement.value == ""){
    //add disable to finish
    closeCase.classList.add("disabled");
    
    //add error handler colors
    selectElement.parentElement.classList.add('invalid');
    
    // listen for input element change
    selectElement.addEventListener('change', (e) => {
        if (e.target.value !== ""){
            e.target.parentElement.classList.contains('invalid') ? e.target.parentElement.classList.remove('invalid') : "";
        } else {
            console.log(`${e.target} value changed to null!`)
        }
        
        const invalidInputs = Array.from(document.querySelectorAll('.invalid'));
        
        invalidInputs.length != 0 ? "" : closeCase.classList.remove("disabled");
        console.log({invalidInputs})
    });
} else {
    console.log(`${selectElement} is valid!`)
}
}


function checkValidURL() {
  let currentURL = location.href;
  let allowedURL = [
      "https://redbull.corp.google.com",
      "https://cases-testing.connect-canary.corp.google.com",
      "https://cases-testing.connect.corp.google.com",
      "https://cases.connect.corp.google.com"
  ];
  
  allowedURL.forEach((url) => {
     currentURL.includes(url) ? init() : console.log("Forbidden URL");
  });
  
  
  if (currentURL.includes("https://support.google.com/s/community")) {
      initPanels();
  } else {
      console.log("Forbidden URL");
  }
}

function set_aht(min, sec){
  nmin = min;
  nsec = sec;
  nhour = 0;
}



function getFormattedAHT(date){


let d = date !== "" && date != null ? new Date(date) : "",
    aht = d !== "" && d != null ? `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}` : "";

return aht;
}


function getSelectedQueue(){
let selected = queueSelect.options[queueSelect.selectedIndex].value,
    categoryData = data.SRCategories;
if (selected == "Survey Review") {
    categoryData = data.SRCategories;
} else if(selected == "Support") {
    categoryData = data.supportCategories;
} else if(selected == "Publisher") {
    categoryData = data.pubCategories;
} else if(selected == "Publisher-New") {
    categoryData = data.pubCategories;
} else if(selected == "Publisher-Support") {
    categoryData = data.pubCategories;
} else if(selected == "Partnership"){
    categoryData = data.partnershipCategories;
} else if(selected == "NonTransaction"){
    categoryData = data.nonTransactionCategories;
} else {
    console.log('Invalid queue: ' + selected);
}
return categoryData;
}

function clearClass(){
  const customerTypeSelect = document.querySelector('#customer-type'),
  countryInput = document.querySelector('#countryInput'),
  languageInput = document.querySelector('#languageInput'),
  queueSelect = document.querySelector('#queue-select');

  // queueSelect.parentElement.classList.remove('s12');
  customerTypeSelect.parentElement.classList.remove('hide');
  //surveyStatusSelect.parentElement.classList.remove('hide');
//   languageInput.parentElement.classList.remove('hide');
  toggleDecisionBtn();
  
}

function returnCategories(array){
let categories = [];
array.forEach((category) => {
    categories.push(`<option value="${category.name}">${category.name}</option>`);
});
return categories;
}

function _doClearClass(e){
if (e.className.includes("hide") != -1){
  e.classList.remove("hide");
}
}



function checkDarkMode(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  settings.dark_mode === true ? initDarkMode() : console.log("Dark Mode Deactivated");
}


function checkPosition(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  settings.change_position === true ? initPosition() : console.log("Position Changed!");
}

function checkTemper(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  settings.show_temper === true ? initTemper() : console.log("Temper toggled!");
}

function checkMV(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  settings.show_MV === true ? initMV() : console.log("M/V toggled!");
}

function checkNI(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  settings.show_NI === true ? initNI() : console.log("NI toggled!");
}

function checkCaseReminder(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  settings.case_reminder === true ? initAlarm() : console.log("NI toggled!");
}

function checkConsultMonitoring(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  settings.consult_monitoring === true ? initConsultMonitoring() : console.log("Consult Monitoring toggled!");
}

function checkNotifications(){
  const notificationsBtn = document.querySelector('#notifications-btn');
  const notificationsIcon = document.querySelector('#notifications-btn > i');
  let notifications = JSON.parse(localStorage.getItem('notifications'));
  
  let change = () => {
      notificationsIcon.textContent = `notifications`;
      notificationsIcon.classList.remove('red-icon');
  };
  
  let changeAgain = () => {
      notificationsIcon.textContent = `notifications_active`;
      notificationsIcon.classList.add('red-icon');
  }
  
  
  notifications.seen === true ? change() : changeAgain();
}


function clearCardValues(){
  dataChips = [];
  targetingChips = [];
  surveyReviewQueue();
  
  let queueSelect = document.querySelector('#queue-select'),
      violationsChip = document.querySelector('#violations-chip'),
      countryInput = document.querySelector('#countryInput'),
      languageInput = document.querySelector('#languageInput'),
      rmto = document.querySelector('#rmto'),
      numberOfQuestionsSelect = document.querySelector('#numberOfQuestions'),
      timesReviewedSelect = document.querySelector('#timesReviewed'),
    //   surveyStatusSelect = document.querySelector('#surveystatus-select'),
      screenshotText = document.querySelector('#screenshot-text'),
      targetingCategories = document.querySelector('#targeting-categories'),
      targetingDropdown = document.querySelector('#targeting-dropdown'),
      numberOfQuestions = document.querySelector('#numberOfQuestions'),
      timesReviewed = document.querySelector('#timesReviewed'),
      searchWrappers = Array.from(document.querySelectorAll('.inputWrapper')),
      invalidInputs = Array.from(document.querySelectorAll('.invalid'));
  
  invalidInputs.length != 0 ? invalidInputs.forEach(input => input.classList.remove('invalid')) : "";
  searchWrappers.forEach(r => r.remove());
  numberOfQuestions.selectedIndex = 0,
  timesReviewed.selectedIndex = 0,
  targetingCategories.selectedIndex = 0,
  targetingDropdown.selectedIndex = 0,
  queueSelect.selectedIndex = 5,
  countryInput.value = "",
  countryInput.dataset.langcode = "",
  languageInput.value = "",
  languageInput.dataset.langcode = "",
  rmto.checked = false,
  
//   surveyStatusSelect.selectedIndex = 0,
  numberOfQuestionsSelect = 0,
  timesReviewedSelect = 0,
  
  $(".chips .chip").remove(),
  screenshotText.value = "";
}

function preFinish(){
  let assigned = JSON.parse(localStorage.getItem('assigned')),
      caseID = document.querySelector('#caseID'),
      caseIDArray = caseID.value.split(",").length,
      caseInteractions = caseIDArray != 1 || 0 ? caseIDArray : 1,
      endDate = checkNeedsInfo() ? assigned.end_time : getFormattedDate(),
      aht = Math.abs(new Date(endDate) - new Date(assigned.start_time)),
      min = Math.floor((aht/1000)/60),
      sec = Math.floor((aht/1000)%60),
      data = gatherData();

  assigned["number_of_interactions"] = caseInteractions;
  assigned["end_time"] = endDate;
  assigned["aht"] = "00:" + min + ':' + sec;

  assigned["queue"] = data.queue;
  assigned["violations"] = data.violations;
  assigned["country"] = data.country;
  assigned["language"] = data.language;
  assigned["surveyType"] = data.surveyType;
  assigned["targeting"] = data.targeting;
  assigned["RMTO"] = data.RMTO;
  assigned["surveyStatus"] = data.surveyStatus;
  assigned["screenshotText"] = data.screenshotText;
  assigned["numberOfQuestions"] = data.numberOfQuestions;
  assigned["timesReviewed"] = data.timesReviewed;
  
  localStorage.setItem("assigned", JSON.stringify(assigned));
  
  console.log(data.language);
}

function getParameters(){
    let assigned = JSON.parse(localStorage.getItem('assigned'));
    console.log("notString: " + typeof assigned.survey_ids);
    console.log("string: " + typeof assigned.survey_ids.toString());
    
    const identifyCase = (id) => {
        if (id.includes(`'`)) {
            id = id.replace(/'/g,'')
        }
        if (!id.includes('-')) return 'EWOQ'
        if (id.split('-')[0].length != 1) return 'EWOQ'
        
        return 'Cases 2.0'
    };
    
    console.log('caseID', identifyCase(assigned.survey_ids.toString()))
    
    let reviewStatus = "reviewStatus=reviewed",
        referenceID = `referenceID=`,
        caseID = `caseID=${assigned.survey_ids.toString()}`,
        queueType = `queueType=${assigned.queue}`,
        customerType = `customerType=`,
        tool = `tool=${identifyCase(assigned.survey_ids.toString())}`,
        language = `language=${assigned.language}`,
        country = `country=${assigned.country}`,
        RMTO = `RMTO=${assigned.RMTO}`,
        surveyType = `surveyType=${assigned.surveyType}`,
        screenshot = `screenshot=${assigned.screenshotText}`,
        surveyDecision = `surveyDecision=${assigned.queue == "Support" ? "" : assigned.decision}`,
        startTimeMNL = `startTimeMNL=${assigned.start_time}`,
        startTimePST = `startTimePST=`,
        endTimeMNL = `endTimeMNL=${assigned.end_time}`,
        categories = `categories=${assigned.violations}`,
        AHT = `AHT=${assigned.aht}`,
        numberOfQuestions = `numberOfQuestions=${assigned.numberOfQuestions}`,
        timesReviewed = `timesReviewed=${assigned.timesReviewed}`,
        numberOfInteractions = `numberOfInteractions=${assigned.number_of_interactions}`;
    
    return `${reviewStatus}&${referenceID}&${caseID}&${queueType}&${customerType}&${tool}&${language}&${country}&${RMTO}&${surveyType}&${screenshot}&${surveyDecision}&${startTimeMNL}&${startTimePST}&${endTimeMNL}&${categories}&${AHT}&${numberOfInteractions}&${numberOfQuestions}&${timesReviewed}`;
}

function getCaseData(){
    let assigned = JSON.parse(localStorage.getItem('assigned'));
    console.log("notString: " + typeof assigned.survey_ids);
    console.log("string: " + typeof assigned.survey_ids.toString());
    
    const identifyCase = (id) => {
        if (id.includes(`'`)) {
            id = id.replace(/'/g,'')
        }
        if (!id.includes('-')) return 'EWOQ'
        if (id.split('-')[0].length != 1) return 'EWOQ'
        
        return 'Cases 2.0'
    };
    
    console.log('language', assigned.language)
    
    let reviewStatus = `reviewed`,
        referenceID = ``,
        caseID = `${assigned.survey_ids.toString()}`,
        queueType = `${assigned.queue}`,
        customerType = ``,
        tool = `${identifyCase(assigned.survey_ids.toString())}`,
        language = `${assigned.language != 'undefined' ? assigned.language : ""}`,
        country = `${assigned.country}`,
        RMTO = `${assigned.RMTO}`,
        surveyType = `${assigned.surveyType}`,
        targeting = `${assigned.targeting}`,
        screenshot = `${assigned.screenshotText}`,
        surveyDecision = `${assigned.queue == "Support" ? "" : assigned.decision}`,
        startTimeMNL = `${assigned.start_time}`,
        startTimePST = ``,
        endTimeMNL = `${assigned.end_time}`,
        categories = `${decodeURIComponent(assigned.violations)}`,
        AHT = `${assigned.aht}`,
        numberOfQuestions = `${assigned.numberOfQuestions}`,
        timesReviewed = `${assigned.timesReviewed}`,
        numberOfInteractions = `${assigned.number_of_interactions}`;
    
    return {
        reviewStatus,
        referenceID,
        caseID,
        queueType,
        customerType,
        tool,
        language,
        country,
        RMTO,
        surveyType,
        targeting,
        screenshot,
        surveyDecision,
        startTimeMNL,
        startTimePST,
        endTimeMNL,
        categories,
        AHT,
        numberOfQuestions,
        timesReviewed,
        numberOfInteractions
    }
}

function checkBLSMode(){
  let settings = JSON.parse(localStorage.getItem('settings'));
  return settings.bls_mode === true ? initBLSMode() : console.log("BLS Mode Deactivated");
}

function checkNeedsInfo(){
  let assigned = JSON.parse(localStorage.getItem('assigned'));
  return assigned.needs_info === true ?  true : false;
}

function initDecisionButtons(){
  const compliantBtn = document.querySelector('#compliant-btn'),
    closeBtn = document.querySelector('#close-btn'),
    noncompliantBtn = document.querySelector('#noncompliant-btn'),
    enable_actions = document.querySelector('#enable_actions'),
    caseTemplateBtn = document.querySelector('#caseTemplateBtn'),
    closeCase = document.querySelector('#closeCase');
    
  _doClearClass(caseTemplateBtn);
  _doClearClass(compliantBtn);
  _doClearClass(closeBtn);
  _doClearClass(noncompliantBtn);
}
  
function disableButtons(){
  let assignBtn = document.querySelector('#assignSurvey'),
      unassignBtn = document.querySelector('#unassignSurvey'),
      needsInfoBtn = document.querySelector('#needsInfoBtn'),
      consultBtn = document.querySelector('#consultBtn'),
      caseIDInput = document.querySelector('#caseID');
  
  
  caseIDInput.toggleAttribute("disabled");
  assignBtn.classList.toggle("disabled");
  unassignBtn.classList.toggle("disabled");
  needsInfoBtn.classList.toggle("disabled");
  consultBtn.classList.toggle("disabled");
  clearInterval(refreshIntervalId);
}

function enableButtons(){
  const compliantBtn = document.querySelector('#compliant-btn'),
      closeBtn = document.querySelector('#close-btn'),
      noncompliantBtn = document.querySelector('#noncompliant-btn'),
      enable_actions = document.querySelector('#enable_actions'),
      closeCase = document.querySelector('#closeCase');
  
  compliantBtn.classList.toggle('disabled');
  closeBtn.classList.toggle('disabled');
  noncompliantBtn.classList.toggle('disabled');
  enable_actions.classList.toggle('disabled');
  closeCase.classList.toggle('disabled');
}

function getFormattedDate(dateGiven){
  let date = dateGiven == null || undefined  ? new Date(): new Date(dateGiven),
  formattedDate = (date.getMonth() + 1) + '/' + date.getDate() +  "/" + date.getFullYear();
  return formattedDate = formattedDate + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function AHT() {
  document.querySelector('#aht').innerText = nhour + ":" + nmin + ":" + nsec;
  if (!isPaused) {
      nsec += 1;
      if (nsec == 60) {
          nsec = 00;
          nmin += 1;
      } else if (nmin == 60) {
          nmin = 00;
          nhour += 1;
      }
  }
}
});



