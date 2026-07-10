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

  Identificarea completă a părților (CUI, adresă, email etc.) apare automat în antetul
  documentului, înaintea acestor secțiuni; secțiunile „Clauze speciale" (dacă există) și
  „Semnături electronice" sunt adăugate automat după, cu numerotare continuată.

  ATENȚIE: modificările se aplică și la regenerarea PDF-ului contractelor DEJA semnate
  (documentul final nu e încă persistat separat — vezi ROADMAP). Modificări de substanță se fac
  cu prudență după lansare.

  Necesită avizare juridică înainte de lansarea plătită (vezi ROADMAP — Phase 3).
-->
## Părțile contractante

Prezentul contract se încheie între {{owner.name}}, în calitate de proprietar, și {{tenant.name}},
în calitate de chiriaș, identificați potrivit datelor din antetul prezentului document.

## Obiectul contractului

Proprietarul, {{owner.name}}, transmite chiriașului, {{tenant.name}}, dreptul de folosință asupra
imobilului „{{property.title}}", situat în {{property.location}} (denumit în continuare
„Imobilul"), împreună cu dotările existente la data predării, consemnate în procesul-verbal de
predare-primire.

Imobilul se închiriază exclusiv cu destinația de locuință. Schimbarea destinației este permisă
numai cu acordul prealabil scris al proprietarului.

## Durata contractului

Contractul se încheie pe o durată de {{months}} luni, începând cu data de {{startDate}} și până la
data de {{endDate}}.

La expirarea duratei, contractul poate fi prelungit prin acordul scris al părților (act adițional
sau reînnoire prin platformă). Tacita relocațiune (art. 1810 Cod civil) este exclusă: simpla
rămânere în folosință a Imobilului după expirare nu prelungește contractul.

## Chiria și modalitatea de plată

Chiria lunară este de {{rent}} și se achită prin platforma Clavium.ro, până cel târziu în ziua de
{{dueDay}} a fiecărei luni, pentru luna în curs.

Pentru fiecare zi de întârziere se percep penalități de 0,1% din suma restantă, fără ca totalul
penalităților să poată depăși cuantumul sumei asupra căreia se calculează. Neplata chiriei timp de
30 de zile de la scadență dă dreptul proprietarului să rezilieze contractul în condițiile
secțiunii „Încetarea contractului".

## Garanția (depozitul)

La încheierea contractului, chiriașul constituie o garanție de {{deposit}}, destinată acoperirii
eventualelor prejudicii cauzate Imobilului, a restanțelor la chirie sau la utilități.

Garanția se restituie chiriașului în termen de 30 de zile de la predarea Imobilului, după
deducerea sumelor datorate, pe baza procesului-verbal de predare-primire. Garanția nu poate fi
folosită de chiriaș drept plată a ultimei luni de chirie fără acordul scris al proprietarului.

## Obligațiile proprietarului

- să predea Imobilul în stare corespunzătoare utilizării ca locuință, împreună cu accesoriile sale, la data începerii contractului, pe bază de proces-verbal de predare-primire;
- să asigure chiriașului liniștita și utila folosință a Imobilului pe toată durata contractului (art. 1786 Cod civil);
- să efectueze reparațiile majore și structurale (instalații comune, acoperiș, elemente de structură), cu excepția celor cauzate din culpa chiriașului;
- să achite impozitele și taxele aferente dreptului său de proprietate.

## Obligațiile chiriașului

- să folosească Imobilul cu prudență și diligență, potrivit destinației de locuință;
- să achite chiria la termen și utilitățile aferente consumului propriu (energie, apă, gaze, internet, întreținere), dacă părțile nu convin altfel în clauzele speciale;
- să efectueze reparațiile locative de întreținere curentă (art. 1788 Cod civil);
- să nu subînchirieze, să nu cedeze folosința și să nu schimbe destinația Imobilului fără acordul prealabil scris al proprietarului;
- să permită proprietarului accesul în Imobil pentru verificări sau reparații, cu notificare prealabilă de minimum 24 de ore (cu excepția urgențelor);
- să predea Imobilul la încetarea contractului în starea în care l-a primit, uzura normală exceptată.

## Încetarea contractului

Contractul încetează: la expirarea duratei; prin acordul scris al părților; prin denunțare
unilaterală de către chiriaș, cu un preaviz de 60 de zile transmis prin platformă; prin reziliere,
în cazul neexecutării obligațiilor esențiale (inclusiv neplata chiriei timp de 30 de zile de la
scadență), cu notificare prealabilă de 30 de zile.

La încetare, părțile încheie un proces-verbal de predare-primire; restituirea garanției urmează
regulile secțiunii „Garanția (depozitul)".

## Răspunderea și forța majoră

Partea care nu își execută obligațiile răspunde pentru prejudiciul cauzat, în condițiile legii.
Niciuna dintre părți nu răspunde pentru neexecutarea cauzată de un eveniment de forță majoră
(art. 1351 Cod civil); partea afectată notifică cealaltă parte în cel mult 5 zile de la apariția
evenimentului și face dovada acestuia.

## Protecția datelor cu caracter personal

Părțile prelucrează datele cu caracter personal din prezentul contract exclusiv în scopul
încheierii și executării acestuia, cu respectarea Regulamentului (UE) 2016/679 (GDPR). Detaliile
privind prelucrarea efectuată de platformă sunt disponibile în politica de confidențialitate
Clavium.ro.

## Notificări

Comunicările dintre părți se transmit prin platforma Clavium.ro sau prin email, la adresele
menționate în partea introductivă, și se consideră primite la data transmiterii, dacă aceasta este
zi lucrătoare, sau în prima zi lucrătoare următoare.

## Legea aplicabilă și litigiile

Prezentul contract este guvernat de legea română — Codul civil (art. 1777–1823) și Legea locuinței
nr. 114/1996. Părțile vor încerca soluționarea amiabilă a oricărui diferend; în lipsa unei
soluții, competența aparține instanțelor judecătorești de la locul situării Imobilului.
Consumatorii se pot adresa și ANPC (anpc.ro) sau platformei europene SOL.

## Semnătura electronică

Contractul se încheie în formă electronică și se semnează cu semnătură electronică prin platforma Clavium.ro, în conformitate cu Regulamentul (UE) nr. 910/2014 (eIDAS) și Legea nr. 214/2024.
Părțile convin că documentul semnat electronic, împreună cu jurnalul de audit al platformei
(amprenta SHA-256 și referințele semnăturilor), face dovada încheierii și a conținutului
prezentului contract.
