<!--
  MODEL: CONTRACT DE ÎNCHIRIERE A LOCUINȚEI — șablon editabil

  Acest fișier este textul juridic al contractului de închiriere generat de platformă (PDF +
  pagina contractului). Editează-l liber — codul nu trebuie atins.

  Sintaxă:
    ## Titlu        → secțiune nouă; numerotarea (1., 2., …) se face AUTOMAT, în ordinea din fișier
    linie goală     → paragraf nou
    - text          → sub-punct (afișat cu liniuță)
    <!-- ... -->    → comentariu (nu apare în document)

  Placeholder-e disponibile (înlocuite cu datele contractului):
    {{number}}            numărul contractului            {{rent}}       chiria lunară (formatată)
    {{property.title}}    titlul proprietății             {{deposit}}    garanția (formatată)
    {{property.location}} adresa/localitatea              {{months}}     durata în luni
    {{owner.name}}        numele proprietarului           {{dueDay}}     ziua scadenței lunare
    {{tenant.name}}       numele chiriașului              {{startDate}}  data începerii
    {{price}}             prețul de vânzare (la vânzare)  {{endDate}}    data încetării

  Identificarea completă a părților (CNP, adresă, email etc.) apare automat în antetul
  documentului, înaintea acestor secțiuni; secțiunile „Clauze speciale" (dacă există) și
  „Semnături electronice" sunt adăugate automat după, cu numerotare continuată.

  Iul 2026: text consolidat cu modelul juridic „Contract_inchiriere.docx" (titlu executoriu,
  pact comisoriu, înregistrare ANAF, certificat energetic, regim hotelier, acces, utilități).
  Adaptări față de model: plata exclusiv prin platformă, tacita relocațiune exclusă, datele
  părților vin din antet (fără rubrici de completat manual); anexele (proces-verbal, inventar,
  regulile locuinței) rămân documente separate — vezi ROADMAP.

  ATENȚIE: modificările se aplică și la regenerarea PDF-ului contractelor DEJA semnate
  (documentul final nu e încă persistat separat — vezi ROADMAP). Modificări de substanță se fac
  cu prudență după lansare.

  Necesită avizare juridică înainte de lansarea plătită (vezi ROADMAP — Phase 3).
-->
## Părțile contractante

Prezentul contract se încheie în temeiul art. 1777–1823 din Codul civil (Legea nr. 287/2009,
republicată) și al Legii locuinței nr. 114/1996, republicată, între {{owner.name}}, în calitate
de proprietar (locator), și {{tenant.name}}, în calitate de chiriaș (locatar), identificați
potrivit datelor din antetul prezentului document.

## Obiectul contractului

Proprietarul, {{owner.name}}, transmite chiriașului, {{tenant.name}}, dreptul de folosință asupra
imobilului „{{property.title}}", situat în {{property.location}} (denumit în continuare
„Imobilul"), împreună cu dotările existente la data predării.

Predarea Imobilului se face pe bază de proces-verbal de predare-primire, care consemnează starea
Imobilului, bunurile, cheile și indexurile contoarelor la data predării și care face parte
integrantă din prezentul contract.

Imobilul se închiriază exclusiv cu destinația de locuință. Schimbarea destinației (sediu social,
punct de lucru, activitate profesională) este permisă numai cu acordul prealabil scris al
proprietarului, consemnat prin act adițional.

Persoanele care locuiesc permanent împreună cu chiriașul (art. 21 din Legea nr. 114/1996) se
consemnează în clauzele speciale ale contractului; găzduirea permanentă a altor persoane este
permisă numai cu acordul scris al proprietarului.

Proprietarul pune la dispoziția chiriașului o copie a certificatului de performanță energetică al
Imobilului, conform Legii nr. 372/2005, republicată.

## Durata contractului

Contractul se încheie pe o durată de {{months}} luni, începând cu data de {{startDate}} și până la
data de {{endDate}}.

La expirarea duratei, contractul poate fi prelungit prin acordul scris al părților (act adițional
sau reînnoire prin platformă). Tacita relocațiune (art. 1810 Cod civil) este exclusă: simpla
rămânere în folosință a Imobilului după expirare nu prelungește contractul.

## Chiria și modalitatea de plată

Chiria lunară este de {{rent}} și se achită prin platforma Vatrio.ro, până cel târziu în ziua de
{{dueDay}} a fiecărei luni, pentru luna în curs. Dacă chiria este stabilită în altă monedă decât
leul, plata se face în lei la cursul BNR din ziua plății, dacă părțile nu convin altfel.

Pentru fiecare zi de întârziere se percep penalități de 0,1% din suma restantă, fără ca totalul
penalităților să poată depăși cuantumul sumei asupra căreia se calculează. Neplata chiriei timp de
30 de zile de la scadență dă dreptul proprietarului să rezilieze contractul în condițiile
secțiunii „Încetarea contractului".

Chiria poate fi indexată anual, prin act adițional, cu rata inflației (indicele prețurilor de
consum comunicat de INS) sau într-un alt mod convenit de părți în clauzele speciale.

## Garanția (depozitul)

La încheierea contractului, chiriașul constituie o garanție de {{deposit}}. Garanția nu reprezintă
plată anticipată a chiriei și nu poate fi folosită de chiriaș pentru acoperirea ultimei luni de
chirie fără acordul scris al proprietarului.

Garanția se restituie chiriașului în termen de 30 de zile de la predarea Imobilului și semnarea
procesului-verbal de predare la restituire, după deducerea, pe bază de documente justificative, a:

- chiriilor și penalităților restante;
- utilităților neachitate aferente perioadei de folosință;
- contravalorii bunurilor lipsă sau a degradărilor imputabile chiriașului, constatate prin procesul-verbal, cu excepția uzurii normale.

## Utilitățile și cheltuielile

Chiriașul suportă, pe durata folosinței, contravaloarea utilităților aferente consumului propriu:
energie electrică, gaze naturale, apă, salubritate, întreținerea datorată asociației de
proprietari, internet/TV (dacă este cazul). Plata se face direct către furnizori, dacă părțile nu
convin altfel în clauzele speciale.

Proprietarul suportă: impozitul pe clădire și pe venitul din chirie, asigurarea obligatorie a
locuinței (PAD, conform Legii nr. 260/2008) și cea facultativă (dacă există), precum și
reparațiile capitale și cele care nu sunt în sarcina chiriașului.

## Obligațiile proprietarului

- să predea Imobilul în stare corespunzătoare utilizării ca locuință, împreună cu accesoriile sale, la data începerii contractului, pe bază de proces-verbal de predare-primire;
- să asigure chiriașului liniștita și utila folosință a Imobilului pe toată durata contractului și să îl garanteze contra evicțiunii și a viciilor ascunse (art. 1786 Cod civil);
- să efectueze, pe cheltuiala sa și într-un termen rezonabil de la notificare, reparațiile capitale, cele structurale și cele determinate de uzura normală ori de vicii de construcție, cu excepția celor cauzate din culpa chiriașului;
- să înregistreze contractul la organul fiscal competent (ANAF) în termen de cel mult 30 de zile de la încheiere sau modificare, conform art. 120 alin. (6^1) din Codul fiscal, și să declare veniturile obținute;
- să achite impozitele și taxele aferente dreptului său de proprietate;
- să nu tulbure folosința Imobilului de către chiriaș.

## Obligațiile chiriașului

- să folosească Imobilul cu prudență și diligență, exclusiv potrivit destinației de locuință;
- să achite chiria la termen și utilitățile aferente consumului propriu, în condițiile secțiunilor „Chiria și modalitatea de plată" și „Utilitățile și cheltuielile";
- să efectueze, pe cheltuiala sa, reparațiile locative de întreținere curentă rezultate din folosința obișnuită (art. 1788 și art. 1802 Cod civil) și să remedieze degradările cauzate din culpa sa ori a persoanelor primite în Imobil;
- să nu subînchirieze Imobilul, total sau parțial, să nu cedeze contractul și să nu îl exploateze în regim hotelier (Airbnb, Booking sau platforme similare) fără acordul prealabil scris al proprietarului;
- să anunțe de îndată proprietarul despre orice defecțiune, avarie sau nevoie de reparații aflate în sarcina acestuia, precum și despre orice tulburare a folosinței de către terți;
- să nu efectueze modificări, îmbunătățiri sau intervenții la instalații fără acordul scris al proprietarului; lucrările autorizate rămân câștigate Imobilului fără despăgubire, dacă părțile nu convin altfel;
- să permită proprietarului accesul în Imobil în condițiile secțiunii „Accesul în Imobil";
- să respecte regulamentul asociației de proprietari și normele de conviețuire;
- să predea Imobilul la încetarea contractului liber de persoane și bunuri proprii, cu toate cheile și bunurile primite, în starea consemnată la predare, uzura normală exceptată.

## Accesul în Imobil

Proprietarul poate vizita Imobilul pentru verificarea stării acestuia sau pentru lucrări aflate în
sarcina sa, cu notificarea prealabilă a chiriașului cu cel puțin 24 de ore înainte, la ore
rezonabile și în prezența chiriașului, dacă acesta o solicită.

În situații de urgență (inundație, incendiu, scurgeri de gaz, avarii care riscă să se extindă),
accesul este permis imediat, cu informarea chiriașului de îndată ce este posibil.

În ultimele 30 de zile de contract, chiriașul va permite prezentarea Imobilului către potențiali
chiriași sau cumpărători, cu programare prealabilă.

## Încetarea contractului

Contractul încetează: la expirarea duratei, tacita relocațiune fiind exclusă; prin acordul scris
al părților; prin denunțare unilaterală de către chiriaș, cu un preaviz de cel puțin 60 de zile
transmis prin platformă (art. 1825 alin. (1) Cod civil — orice clauză care înlătură sau restrânge
acest drept este considerată nescrisă); prin reziliere, în condițiile de mai jos; prin pieirea
totală a Imobilului sau imposibilitatea folosirii lui; prin înstrăinarea Imobilului, numai în
condițiile art. 1812–1813 Cod civil.

Pact comisoriu: contractul se consideră reziliat de plin drept, fără intervenția instanței și fără
altă formalitate în afara unei notificări scrise prealabile rămase fără efect timp de 15 zile, în
cazul: neplății chiriei sau a utilităților timp de 30 de zile de la scadență; subînchirierii,
cedării folosinței sau exploatării în regim hotelier fără acord; schimbării destinației;
degradării grave a Imobilului; comportamentului care face imposibilă conviețuirea cu vecinii
(art. 1830 Cod civil). Simetric, chiriașul poate rezilia contractul, după notificare prealabilă
rămasă fără efect 15 zile, dacă proprietarul nu asigură folosința utilă a Imobilului.

La încetare, indiferent de cauză, părțile încheie un proces-verbal de predare la restituire, cu
indexurile finale ale contoarelor și constatările privind starea Imobilului; restituirea garanției
urmează regulile secțiunii „Garanția (depozitul)".

## Titlul executoriu

Prezentul contract, încheiat pe durată determinată și înregistrat la organul fiscal competent,
constituie titlu executoriu pentru plata chiriei la termenele și în modalitățile stabilite,
conform art. 1798 Cod civil.

Contractul constituie titlu executoriu și în privința obligației chiriașului de a restitui
Imobilul: la expirarea termenului (art. 1809 alin. (2)–(3) Cod civil), respectiv la împlinirea
termenului de preaviz în caz de denunțare unilaterală (art. 1816 alin. (3) Cod civil).

## Răspunderea și forța majoră

Chiriașul răspunde pentru degradarea Imobilului și a bunurilor din dotare produsă în timpul
folosinței, inclusiv de membrii familiei, vizitatori sau alte persoane primite în Imobil, precum
și pentru incendiul produs din cauza sa, în condițiile art. 1821–1822 Cod civil. Bunurile
personale ale chiriașului nu sunt acoperite de asigurările proprietarului; chiriașul poate încheia
o asigurare facultativă proprie.

Niciuna dintre părți nu răspunde pentru neexecutarea cauzată de un eveniment de forță majoră
(art. 1351 Cod civil); partea afectată notifică cealaltă parte în cel mult 5 zile de la apariția
evenimentului și face dovada acestuia. Dacă evenimentul durează mai mult de 30 de zile, oricare
parte poate denunța contractul fără daune-interese.

## Protecția datelor cu caracter personal

Părțile prelucrează datele cu caracter personal din prezentul contract exclusiv în scopul
încheierii și executării acestuia, al îndeplinirii obligațiilor legale (inclusiv fiscale) și al
constatării, exercitării sau apărării unor drepturi în justiție, cu respectarea Regulamentului
(UE) 2016/679 (GDPR). Copiile actelor de identitate se păstrează doar cât este necesar acestor
scopuri. Detaliile privind prelucrarea efectuată de platformă sunt disponibile în politica de
confidențialitate Vatrio.ro.

## Notificări

Comunicările dintre părți se transmit prin platforma Vatrio.ro sau prin email, la adresele
menționate în partea introductivă, și se consideră primite la data transmiterii, dacă aceasta este
zi lucrătoare, sau în prima zi lucrătoare următoare.

## Legea aplicabilă și litigiile

Prezentul contract este guvernat de legea română — Codul civil (art. 1777–1823) și Legea locuinței
nr. 114/1996. Părțile vor încerca soluționarea amiabilă a oricărui diferend; în lipsa unei
soluții, competența aparține instanțelor judecătorești de la locul situării Imobilului.
Consumatorii se pot adresa și ANPC (anpc.ro), inclusiv structurii SAL pentru soluționarea
alternativă a litigiilor.

## Semnătura electronică

Contractul se încheie în formă electronică și se semnează cu semnătură electronică prin platforma Vatrio.ro, în conformitate cu Regulamentul (UE) nr. 910/2014 (eIDAS) și Legea nr. 214/2024.
Părțile convin că documentul semnat electronic, împreună cu jurnalul de audit al platformei
(amprenta SHA-256 și referințele semnăturilor), face dovada încheierii și a conținutului
prezentului contract.
