"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VoxelMap } from "../components/VoxelMap";
import { Train } from "../components/Train";
import { TrackSystem } from "../components/TrackSystem";
import * as THREE from "three";
import { useRef, useMemo, useState, Suspense, useEffect } from "react";
import { FollowCamera } from "../components/FollowCamera";
import { StationSign } from "../components/StationSign";
import { ScrollControls, useScroll } from "@react-three/drei";
import { LayoutProvider, useLayout } from "../components/LayoutContext";
import { BufferStop } from "../components/BufferStop";

// Define stops relative to station count
export interface StationData {
    label: string;
    desc: string;
    subChapters?: StationData[];
}

const STATION_DATA: StationData[] = [
    { label: "Witaj w ZSK", desc: "Rozpoczynamy podróż po Twoją przyszłość w Zespole Szkół Komunikacji. Tutaj, blok po bloku, budujemy kompetencje jutra. Jesteśmy miejscem, gdzie łączy się ponad 75-letnia tradycja z najnowocześniejszymi technologiami: od kolejnictwa, przez automatykę, aż po zaawansowane IT. Przejedź się po naszych profilach, poznaj możliwości i wybierz kierunek, który nada pęd Twojej karierze." },
    {
        "label": "Dlaczego ZSK?",
        "desc": "Wybór szkoły średniej to decyzja na lata. Zobacz, dlaczego Zespół Szkół Komunikacji w Poznaniu to miejsce inne niż wszystkie. To nie tylko nauka, to gwarancja jakości potwierdzona twardymi danymi.",
        "subChapters": [
            { "label": "Szkoła z czołówki", "desc": "ZSK od lat niezmiennie utrzymuje się w ścisłej czołówce ogólnopolskiego rankingu „Perspektywy”. Wysoka zdawalność matur i egzaminów zawodowych sprawia, że dyplom naszej szkoły jest przepustką na najlepsze uczelnie techniczne." },
            { "label": "Klasy dwujęzyczne", "desc": "Jako jedna z niewielu szkół technicznych oferujemy profile dwujęzyczne (informatyk i programista). Uczysz się przedmiotów zawodowych (np. bazy danych, systemy komputerowe) po angielsku. To ogromna przewaga na rynku IT, gdzie język angielski jest standardem komunikacji." },
            { "label": "Idealna lokalizacja", "desc": "Szkoła mieści się przy ul. Fredry – w samym sercu Poznania. Masz stąd kilka minut spacerem na Dworzec Główny oraz doskonały dojazd tramwajami (w tym Pestką) z każdego zakątka miasta i okolic." }
        ]
    },
    {
        label: "Technik szerokopasmowej komunikacji elektronicznej",
        desc: "Powszechny dostęp do szybkiego, szerokopasmowego Internetu we współczesnych gospodarkach na świecie staje się jedną z najważniejszych dziedzin, bez których nie może istnieć nowoczesne społeczeństwo. Obecnie kluczowy w tym kontekście staje się problem, w jaki sposób taki dostęp zapewnić. Technik szerokopasmowej komunikacji elektronicznej to zawód interdyscyplinarny łączący umiejętności kilku specjalności (elektronika, informatyka, telekomunikacja). Odnosi się do bezpośredniej wymiany informacji elektronicznej między ludźmi i urządzeniami przy wykorzystaniu łączności przewodowej, bezprzewodowej lub hybrydowej. W zakresie umiejętności technik będzie budował infrastrukturę zapewniającą przepustowość łączy o dużej prędkości pod: sztuczną inteligencję, telewizję wysokiej rozdzielczości (VOD), e-lerning, połączenia machine-to-machine (M2M) oraz video konferencjami biznesowymi.",
        subChapters: [
            { label: "Oferta edukacyjna", desc: "W ramach kształcenia językowego uczniowie obowiązkowo kontynuują naukę języka angielskiego po szkole podstawowej. Jako dodatkowy język obcy mają do wyboru język hiszpański (nauczany od podstaw) lub język niemiecki (w formie kontynuacji). Wszyscy uczniowie klas pierwszych przystąpią do testów poziomujących z obu tych języków (angielskiego i niemieckiego), które odbędą się podczas spotkań z wychowawcami. W procesie rekrutacji przedmiotami punktowanymi są język obcy nowożytny oraz fizyka, natomiast przedmiotem realizowanym w zakresie rozszerzonym jest matematyka. Ukończenie tego profilu pozwala na zdobycie dwóch kwalifikacji zawodowych: INF.05 (Montaż i eksploatacja instalacji wewnątrzbudynkowych telewizji satelitarnej, kablowej i naziemnej) oraz INF.06 (Montaż i eksploatacja szerokopasmowych sieci kablowych pozabudynkowych)." },
            { label: "Cele kształcenia", desc: "Celem kształcenia w zawodzie technika szerokopasmowej komunikacji elektronicznej jest przygotowanie absolwenta do podjęcia pracy w szerokim spektrum firm telekomunikacyjnych – od dostawców infrastruktury światłowodowej i satelitarnej, przez operatorów komórkowych GSM i kablowych, aż po telewizje kablowe. Absolwenci znajdą zatrudnienie przy budowie i utrzymaniu nowoczesnej infrastruktury komunikacyjnej w kluczowych sektorach gospodarki. W transporcie publicznym będą odpowiedzialni za systemy monitorujące lokalizację i stan pojazdów, informację pasażerską oraz zarządzanie flotą autobusów i pociągów. W sektorze usług publicznych ich praca wesprze automatyzację procesów administracyjnych, ochronę danych oraz usługi zdrowotne i edukacyjne. Z kolei w ramach infrastruktury miejskiej zajmą się technologiami sterowania oświetleniem, monitoringiem stanu dróg i mostów oraz systemami zarządzania odpadami. Program nauczania łączy wiedzę teoretyczną z intensywnym przygotowaniem praktycznym. Uczniowie poznają podstawy elektroniki, systemy transmisji danych, zagadnienia związane z sieciami IP, szerokopasmowymi i usługami cyfrowymi, a także uczą się zawodowego języka angielskiego. Teoria jest na bieżąco weryfikowana podczas zajęć praktycznych, obejmujących rysunek techniczny oraz ćwiczenia w specjalistycznych pracowniach: elektronicznej, instalacji telewizyjnych, usług abonenckich, multimedialnych i sieci szerokopasmowych. Całość edukacji dopełniają praktyki zawodowe, przygotowujące do realnych wyzwań na rynku pracy." },
            { label: "Gwarancja pracy", desc: "Według prognoz Wojewódzkiego Rynku Pracy jest to zawód deficytowy, a więc gwarantujący zatrudnienie. Absolwenci tego kierunku będą także przygotowani do prowadzenia własnej działalności gospodarczej w zakresie budowy szerokopasmowej infrastruktury teleinformatycznej." },
            { label: "Kontynuacja nauki", desc: "Uczniowie kierunku technik szerokopasmowej komunikacji elektronicznej z powodzeniem kontynuują naukę na uczelniach wyższych. Uczęszczając do technikum, oprócz solidnego wykształcenia zawodowego, absolwent naszej szkoły uzyskuje również wszechstronne wykształcenie z przedmiotów ogólnokształcących, umożliwiające kontynuowanie nauki na technicznych uczelniach wyższych." }
        ]
    },
    {
        label: "Technik automatyk",
        desc: "Technik automatyk to osoba, od której wymagana jest stała aktualizacja wiedzy z zakresu nowinek technologicznych, programowania, gdyż branża wciąż się rozwija i nie można poprzestawać na wiedzy bieżącej. Po ukończeniu szkoły, bądź studiów można zostać głównym automatykiem, projektantem automatyki domowej, głównym technologiem w danym zakładzie, automatykiem programistą PLC, głównym kierownikiem utrzymania ruchu a nawet kierownikiem zakładu.",
        subChapters: [
            { label: "Oferta edukacyjna", desc: "W ramach kształcenia językowego uczniowie kontynuują naukę języka angielskiego (jako przedmiotu obowiązkowego) oraz języka niemieckiego (jako przedmiotu dodatkowego). Przydział do grup nastąpi na podstawie testów poziomujących z obu języków, które odbędą się podczas pierwszych spotkań z wychowawcami. W procesie rekrutacji przedmiotami punktowanymi są język obcy nowożytny oraz fizyka. Program nauczania obejmuje matematykę na poziomie rozszerzonym, a w toku edukacji uczniowie zdobywają dwie kwalifikacje zawodowe: ELM.01 (Montaż i uruchamianie urządzeń automatyki przemysłowej) oraz ELM.04 (Eksploatacja układów automatyki przemysłowej)." },
            { label: "Cele kształcenia", desc: "Absolwent kierunku technik automatyk jest merytorycznie i praktycznie przygotowany do realizacji zadań obejmujących pełen cykl życia systemów automatyki. Posiada kompetencje w zakresie montażu i uruchamiania urządzeń oraz instalacji, a także ich bieżącej obsługi. Ponadto jest wykwalifikowany do dbania o sprawność techniczną powierzonego sprzętu poprzez wykonywanie okresowych przeglądów i konserwacji, jak również przeprowadzanie diagnostyki oraz remontów." },
            { label: "Gwarancja pracy", desc: "Według prognoz w ciągu najbliższych lat rynek pracy będzie potrzebował coraz więcej pracowników/specjalistów z branży. Analizując rynek pracy, dostrzegamy duże potrzeby kształcenia w zawodzie technik automatyk. Związane to jest ze stałym rozwojem technologii i nowoczesnego przemysłu 4.0. Dokonując analizy lokalnego rynku pracy, dostrzegamy potrzebę kształcenia w wyżej wymienionym zawodzie. Faktem jest również, że zawód ten w ofercie edukacyjnej słabo występuje w skali całej aglomeracji poznańskiej. Potrzeba kształcenia w zawodzie wynika również z potrzeb pracodawców: Zakład Automatyki Kolejowej, Fabryka Volkswagen, Phoenix Contact, Fibaro oraz inne firmy zajmujące się wdrażaniem automatyki przemysłowej skłonne są już dziś zatrudnić wysoko wykwalifikowanych pracowników posiadających wykształcenie techniczne w zawodzie technik automatyk." }
        ]
    },
    {
        label: "Technik elektronik",
        desc: "Po ukończeniu tego kierunku absolwent będzie potrafił uruchamiać, nadzorować i obsługiwać sprzęt elektroniczny i komputerowy, a także diagnozować stan jego elementów, wykrywać usterki i przeprowadzać niezbędne konserwacje. Będzie posiadał umiejętność projektowania i montowania układów analogowych, cyfrowych, obwodów drukowanych oraz sieci komputerowych, jak również programowania w języku maszynowym procesora. W zakres jego kompetencji wejdzie czytanie schematów ideowych, blokowych i montażowych, posługiwanie się instrukcjami obsługi, dokumentacją serwisową oraz katalogami elementów i układów. Ponadto absolwent będzie przygotowany do mierzenia wielkości elektrycznych i nieelektrycznych wraz z interpretacją wyników, wykorzystywania oprogramowania narzędziowego i użytkowego niezbędnego w pracy, a także analizowania i interpretowania podstawowych zjawisk oraz praw z zakresu elektrotechniki, elektroniki i informatyki.",
        subChapters: [
            { label: "Oferta edukacyjna", desc: "W ramach kształcenia językowego uczniowie kontynuują nauczanie obowiązkowego języka angielskiego oraz dodatkowego języka niemieckiego. Przydział do odpowiednich grup nastąpi na podstawie testów poziomujących z obu języków, które odbędą się dla wszystkich uczniów klas pierwszych podczas spotkań z wychowawcami. Przedmiotem realizowanym w zakresie rozszerzonym jest matematyka, natomiast do przedmiotów punktowanych należą język obcy nowożytny oraz fizyka. Tok nauczania prowadzi do zdobycia dwóch kwalifikacji zawodowych: ELM.02 (Montaż oraz instalowanie układów i urządzeń elektronicznych) oraz ELM.05 (Eksploatacja urządzeń elektronicznych)." },
            { label: "Cele kształcenia", desc: "Absolwent szkoły kształcącej w zawodzie technik elektronik powinien być przygotowany do wykonywania zadań zawodowych obejmujących instalowanie, konserwowanie, użytkowanie oraz naprawę urządzeń elektronicznych." },
            { label: "Gwarancja pracy", desc: "Według prognoz w ciągu najbliższych lat rynek pracy będzie potrzebował coraz więcej pracowników/specjalistów z branży elektronicznej. Analizując rynek pracy, dostrzegamy duże potrzeby kształcenia w zawodzie technik elektronik. Związane to jest ze stałym rozwojem technologicznym w branży elektronicznej i informatycznej oraz coraz większym zapotrzebowaniem w wielu branżach. Dostrzegamy potrzebę kształcenia w wyżej wymienionym zawodzie, wynikającą również z zainteresowania wielu pracodawców m.in.: z przemysłu precyzyjnego, zakładów produkcyjnych, kolejowych czy firm instalacyjnych skłonnych już dziś zatrudnić wysoko wykwalifikowanych pracowników posiadających wykształcenie techniczne w zawodzie elektronik." },
            { label: "Patronat", desc: "Kierunek objęty jest patronatem Miejskiego Przedsiębiorstwa Komunikacyjnego w Poznaniu" }
        ]
    },
    {
        label: "Technik informatyk dwujęzyczny",
        desc: "Uczniowie zdobędą wiedzę zarówno z zakresu zaawansowanej konfiguracji, konserwacji i utrzymania systemów operacyjnych dostępnych obecnie na rynku, jak i umiejętności obsługi aplikacji biurowych w rozszerzonym zakresie, obsługi aplikacji wspomagających zarządzanie oraz samodzielnego tworzenia bardziej i mniej skomplikowanych aplikacji i systemów informatycznych, a także nabędą umiejętność projektowania baz danych, zabezpieczania przechowywanych w nich danych oraz efektywnego przeszukiwania zasobów gromadzonych tak w typowych bazach danych, jak i autorskich systemach, korzystając zarówno z narzędzi dostarczanych wraz z baza jak i tworząc własne. Uczniowie będą mieli okazję zaznajomić się z podstawami programowania aplikacji desktopowych, internetowych oraz mobilnych. Ponadto poznają techniczną funkcjonalność sprzętu komputerowego oraz osprzętu teleinformatycznego służącego do łączenia komputerów w sieci. Zdobędą umiejętność diagnozowania typowych usterek i radzenia sobie z prostymi naprawami. Poznają zasady działania podzespołów komputerowych, dzięki czemu efektywnie wykorzystają sprzęt z jakim spotkają się w przyszłości. Absolwenci będą mogli zaprojektować sieć i chronić dane w niej przechowywane przed dostępem z zewnątrz oraz przed ich wypływem. Poznają obsługę sieciowych systemów operacyjnych na poziomie podstaw administratorskich.",
        subChapters: [
            { label: "Oferta edukacyjna", desc: "W Zespole Szkół Komunikacji oferujemy unikalną możliwość nauki w klasach dwujęzycznych w profilu technik informatyk, które łączą wiedzę techniczną z biegłością językową, dając uczniom przewagę na rynku pracy i przygotowując do wyzwań globalnego rynku IT. Uczniowie uczą się przedmiotów zawodowych nie tylko po polsku, ale także w języku angielskim – w przypadku technika informatyka są to historia, bazy danych oraz sieci komputerowe – co pozwala na rozszerzenie słownictwa specjalistycznego, zyskanie swobody wypowiedzi i udział w nowoczesnym modelu edukacji bez dodatkowych kosztów. W procesie rekrutacji do tej klasy kandydat przystępuje do testu kompetencji językowych na poziomie B1+, natomiast oprócz wiodącego języka angielskiego uczniowie wybierają dodatkowy język (hiszpański lub niemiecki), z którego testy poziomujące (w przypadku języka niemieckiego) odbędą się na spotkaniach z wychowawcami. Przedmiotami punktowanymi są język obcy nowożytny i informatyka, a w toku nauki realizowane są przedmioty rozszerzone, czyli matematyka oraz informatyka. Absolwenci zdobywają kwalifikacje INF.02 (Administracja i eksploatacja systemów komputerowych, urządzeń peryferyjnych i lokalnych sieci komputerowych) oraz INF.03 (Tworzenie i administrowanie stronami i aplikacjami internetowymi oraz bazami danych), co w połączeniu z edukacją dwujęzyczną otwiera perspektywy wyjazdów zagranicznych, studiów w Europie oraz atrakcyjnej pracy w branży IT." },
            { label: "Cele kształcenia", desc: "Celem pracy technika informatyka będzie możliwość podejmowania pracy we wszystkich firmach, w których znajduje się sprzęt komputerowy. Mając przygotowanie teoretyczne i praktyczne będą bez wątpienia poszukiwani i cenieni na rynku pracy. Będą mogli wykonywać zadania instalacyjne, obsługiwać systemy aplikacyjne, wspomagać w sytuacjach problemowych i awaryjnych użytkowników aplikacji biurowych i systemów informatycznych." },
            { label: "Gwarancja pracy", desc: "Absolwenci będą mogli także współpracować z zespołami informatyków, podejmując się poważnych zadań projektowych, programowania lub eksploatacji. Według prognoz w ciągu najbliższych lat rynek pracy będzie potrzebował coraz więcej pracowników/specjalistów z branży informatycznej. Dostrzegamy potrzebę kształcenia w wyżej wymienionym zawodzie, wynikającą również z zainteresowania założenia w przyszłości własnej działalności gospodarczej." },
            { label: "Patronat", desc: "Kierunek objęty jest patronatem Politechniki Poznanińskiej" }
        ]
    },
    {
        label: "Technik programista dwujęzyczny",
        desc: "Technik Programista to informatyk, którego specjalizacja jest ukierunkowana na wiodącą dziś dziedzinę informatyki – programowanie. Uczniowie zdobędą wiedzę na temat różnych języków programowania, co umożliwi im tworzenie gier komputerowych, programowanie robotów, programowanie baz danych, tworzenia oprogramowania maszyn i urządzeń przemysłowych oraz wykształceniu umiejętności algorytmicznego i logicznego myślenia. Uczniowie zaznajomią się z podstawami informatyki, projektowania stron internetowych, podstaw projektowania grafiki komputerowej, projektowania i administrowania bazami danych, programowania aplikacji internetowych, projektowania oprogramowania, programowania obiektowego, tworzenia aplikacji mobilnych i desktopowych.",
        subChapters: [
            { label: "Oferta edukacyjna", desc: "W Zespole Szkół Komunikacji oferujemy unikalną możliwość nauki w klasach dwujęzycznych w profilu technik programista, co łączy wiedzę techniczną z biegłością językową i przygotowuje do wyzwań globalnego rynku IT. Uczniowie uczą się przedmiotów zawodowych nie tylko po polsku, ale także w języku angielskim, a są to: historia, systemy baz danych, systemy komputerowe oraz testowanie i dokumentowanie aplikacji. Taki model edukacji zapewnia zwiększoną liczbę godzin języka angielskiego bez dodatkowych kosztów, rozszerzenie słownictwa specjalistycznego oraz naukę praktycznego wykorzystania języka w sytuacjach zawodowych. W procesie rekrutacji do tej klasy kandydat przystępuje do testu kompetencji językowych z zakresu zagadnień leksykalno-gramatycznych na poziomie B1+ według CEFR, natomiast testy poziomujące z języka niemieckiego dla wszystkich uczniów klas pierwszych odbędą się na spotkaniach z wychowawcami. Jako dodatkowy język uczniowie wybierają język hiszpański lub język niemiecki, a przedmiotami punktowanymi przy naborze są język obcy nowożytny oraz informatyka. Program nauczania obejmuje przedmioty rozszerzone, czyli matematykę i informatykę, a w toku edukacji uczniowie zdobywają kwalifikacje INF.03 (Tworzenie i administrowanie stronami i aplikacjami internetowymi oraz bazami danych) oraz INF.04 (Projektowanie, programowanie i testowanie aplikacji). Dołączając do klasy dwujęzycznej, uczeń zyskuje także możliwość udziału w wyjazdach zagranicznych i kontynuowania nauki na uczelniach w Europie, stawiając tym samym pierwszy krok ku międzynarodowej karierze w branży IT." },
            { label: "Cele kształcenia", desc: "Absolwent szkoły kształcącej w zawodzie technik programista powinien być przygotowany do wykonywania następujących zadań zawodowych: · tworzenia i administracji stronami WWW; · tworzenia, administracji i użytkowania relacyjnych baz danych; · programowania aplikacji internetowych; · tworzenia i administracji systemami zarządzania treścią; · projektowania, programowania i testowania zaawansowanych aplikacji webowych; · projektowania, programowania i testowania aplikacji desktopowych; · projektowania, programowania i testowania aplikacji mobilnych." },
            { label: "Gwarancja pracy", desc: "Programista to jeden z najlepiej zarabiających i najbardziej poszukiwanych na rynku pracy zawodów. Po ukończeniu edukacji technik programista może znaleźć pracę w: działach informatycznych wielu firm, agencjach reklamowych, przedsiębiorstwach: produkujących systemy komputerowe; usługowych, zajmujących się projektowaniem, tworzeniem i obsługą systemów informatycznych lub aplikacji internetowych; zajmujących się administracją baz danych; zajmujących się grafiką komputerową; zajmujących się modelowaniem, projektowaniem i drukiem 3D; start-upach, firmach tworzących oprogramowanie komputerowe, sklepach komputerowych, serwisach komputerowych, wydawnictwach, drukarniach, studiach graficznych i dźwiękowych, studiach telewizyjnych i filmowych. Mogą także prowadzić własną działalność i świadczyć usługi doradcze. Dostrzegamy potrzebę kształcenia w wyżej wymienionym zawodzie, wynikającą również z zainteresowania założenia w przyszłości własnej działalności gospodarczej." }
        ]
    },
    {
        label: "Technik transportu kolejowego",
        desc: "Technik transportu kolejowego organizuje oraz prowadzi ruch pociągów na szlakach i posterunkach ruchu, obsługuje urządzenia sterowania ruchem kolejowym i łączności, nadzoruje i koordynuje pracę przewoźników na stacji kolejowej, planuje przewozy pasażerskie i towarowe, zarządza taborem kolejowym, organizuje pracę stacji kolejowej, nadzoruje zestawianie, rozrządzanie i obsługę pociągów, dokonuje odprawy i przewozu przesyłek, ładunków oraz osób",
        subChapters: [
            { label: "Oferta edukacyjna", desc: "W ramach tego profilu uczniowie kontynuują naukę języka angielskiego (jako przedmiotu obowiązkowego realizowanego w zakresie rozszerzonym) oraz języka niemieckiego (jako języka dodatkowego). W procesie rekrutacji przedmiotami punktowanymi są język obcy nowożytny oraz fizyka, a na pierwszych spotkaniach z wychowawcami dla wszystkich uczniów klas pierwszych odbędą się testy poziomujące z obu języków. Kształcenie na tym kierunku umożliwia zdobycie dwóch kwalifikacji zawodowych: TKO.07 (Organizacja i prowadzenie ruchu pociągów) oraz TKO.08 (Planowanie i realizacja przewozów kolejowych)." },
            { label: "Cele kształcenia", desc: "Absolwent szkoły kształcącej w zawodzie technik transportu kolejowego powinien być przygotowany do wykonywania zadań zawodowych obejmujących organizowanie oraz prowadzenie ruchu pociągów na szlakach i posterunkach ruchu, a także obsługiwanie urządzeń sterowania ruchem kolejowym i łączności. Do jego kompetencji należy nadzorowanie i koordynowanie pracy przewoźników na terenie stacji kolejowej, planowanie i organizowanie pasażerskich i towarowych przewozów kolejowych oraz zarządzanie taborem. Ponadto absolwent jest przygotowany do zestawiania, rozrządzania i obsługi pociągów, jak również do realizacji zadań związanych z przygotowaniem do przewozu, odprawą oraz przewozem przesyłek, ładunków i osób." },
            { label: "Gwarancja pracy", desc: "Absolwent szkoły kształcącej w zawodzie technik transportu kolejowego powinien być przygotowany do wykonywania zadań zawodowych obejmujących organizowanie oraz prowadzenie ruchu pociągów na szlakach i posterunkach ruchu, a także obsługiwanie urządzeń sterowania ruchem kolejowym i łączności. Do jego kompetencji należy nadzorowanie i koordynowanie pracy przewoźników na terenie stacji kolejowej, planowanie i organizowanie pasażerskich i towarowych przewozów kolejowych oraz zarządzanie taborem. Ponadto absolwent jest przygotowany do zestawiania, rozrządzania i obsługi pociągów, jak również do realizacji zadań związanych z przygotowaniem do przewozu, odprawą oraz przewozem przesyłek, ładunków i osób." }
        ]
    },
    { label: "Do zobaczenia", desc: "Dojechałeś do stacji końcowej naszej prezentacji, ale dla Ciebie to dopiero początek trasy! Pamiętaj, że pociąg do kariery w ZSK odjeżdża punktualnie. Jeśli chcesz zdobyć zawód przyszłości, uczyć się w świetnej atmosferze i mieć pewność zatrudnienia lub solidną bazę na studia – nie zwlekaj. Złóż wniosek w rekrutacji i dołącz do naszego grona. Do zobaczenia we wrześniu przy ulicy Fredry!" }
];

// CONSTANTS FOR GEOMETRY & TRACK
const TURN_RADIUS = 5;
const TRANSITION = 3;
const SIGN_TRACK_GAP = 5;
const K = 0.55228475;
const LEAD_IN = 9;
const TRACK_START_Z = -10; // Unified Start Position

function AlignmentAutopilot({
    targetT,
    progress,
    curveLength,
    onComplete,
    speed = 25 // Default Fast align
}: {
    targetT: number | null,
    progress: React.MutableRefObject<number>,
    curveLength: number,
    onComplete?: () => void,
    speed?: number
}) {
    useFrame((state, delta) => {
        if (targetT === null || curveLength === 0) return;

        const diff = targetT - progress.current;

        // Threshold to snap (approx 0.1 units on ground)
        const tSnap = 0.1 / curveLength;

        if (Math.abs(diff) < tSnap) {
            progress.current = targetT;
            if (onComplete) onComplete();
            return;
        }

        const dir = Math.sign(diff);
        // Convert ground speed to t speed
        const tSpeed = speed / curveLength;
        const move = dir * tSpeed * delta;

        // Don't overshoot
        if (Math.abs(move) > Math.abs(diff)) {
            progress.current = targetT;
        } else {
            progress.current += move;
        }
    });
    return null;
}

export default function Home() {
    return (
        <main className="relative w-screen h-screen overflow-hidden bg-stone-100">
            {/* Portal Target for 3D UI */}
            <div id="ui-portal" className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex items-center justify-center" />

            <Canvas camera={{ position: [0, 16, 0], fov: 50 }} shadows>
                {/* DARKER SCENE + BRIGHT FRAMES (via Emissive) */}
                <ambientLight intensity={0.2} color="#ffffff" />

                {/* Main Sun: Darker to create mood */}
                <directionalLight
                    position={[15, 20, 10]}
                    intensity={0.6}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-bias={-0.0001}
                    color="#fffaf0"
                />

                {/* Fill Light: Barely visible */}
                <directionalLight
                    position={[-15, 10, -10]}
                    intensity={0.1}
                    color="#e0f0ff"
                />

                <Suspense fallback={null}>
                    {/* Environment removed to prevent overexposure */}
                    <LayoutProvider stations={STATION_DATA}>
                        <SceneContent />
                    </LayoutProvider>
                </Suspense>
            </Canvas>
        </main>
    );
}

function SceneContent() {
    const { trackX, signX, signWidth, trackLength, spacing, cameraY, vpHeight, isMobile } = useLayout();
    const { viewport } = useThree();

    // Dynamic Branch Spacing = Sign Width + Gap (Compact)
    const branchSpacing = signWidth * 2;

    // STATE
    const [activeTrack, setActiveTrack] = useState<'main' | number>('main');
    const [aligningTo, setAligningTo] = useState<number | null>(null);

    // Branch State
    const [currentSubIndex, setCurrentSubIndex] = useState(0);
    const [isReturning, setIsReturning] = useState(false);

    // Distinguish between "Aligning to Enter" and "Aligning to Park"
    const [pendingEntry, setPendingEntry] = useState<number | null>(null);

    // REFS for progress
    const mainProgress = useRef(0);
    const branchProgress = useRef(0);

    // --- DYNAMIC TRACK GENERATION ---

    // Generate Curve: Vertical Line at x = trackX
    const curve = useMemo(() => {
        const points = [
            new THREE.Vector3(trackX, 0.6, TRACK_START_Z),
            new THREE.Vector3(trackX, 0.6, trackLength + 10),
        ];
        return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    }, [trackX, trackLength]);

    const mainCurveLength = useMemo(() => curve.getLength(), [curve]);

    // Calculate STOPS (0..1) based on physical distance
    const stops = useMemo(() => {
        const arr = [];
        const realCurveLength = mainCurveLength;

        for (let i = 0; i < STATION_DATA.length; i++) {
            const zPos = i * spacing;
            const startZ = TRACK_START_Z;
            // t = distance from start / total length
            const t = Math.max(0, Math.min(1, (zPos - startZ) / realCurveLength));
            arr.push(t);
        }
        return arr;
    }, [curve, spacing, mainCurveLength]);


    // --- BRANCH TRACKS GENERATION ---

    const branchCurves = useMemo(() => {
        const curves: { [key: number]: THREE.Curve<THREE.Vector3> } = {};

        STATION_DATA.forEach((station, index) => {
            if (station.subChapters && station.subChapters.length > 0) {
                const startX = trackX;

                // --- GEOMETRY FIRST LOGIC ---
                // 1. Target Z for the Straight Section
                // We want the Straight Track to be exactly `SIGN_TRACK_GAP` below the Main Sign.
                // Main Sign Z = index * spacing.
                const mainSignZ = index * spacing;
                const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;

                // 2. Reverse Engineer StartZ
                // Geometry: Start -> LeadIn -> Transition(+3) -> Turn(+5) -> Straight.
                // So StraightZ = StartZ + TRANSITION + TURN_RADIUS.
                // StartZ = StraightZ - TRANSITION - TURN_RADIUS.
                const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;

                const totalXDist = (station.subChapters.length) * branchSpacing;
                const branchLength = totalXDist + 10;

                const path = new THREE.CurvePath<THREE.Vector3>();

                // 1. LEAD-IN STRAIGHT
                const p1 = new THREE.Vector3(startX, 0.6, startZ - LEAD_IN);
                const p2 = new THREE.Vector3(startX, 0.6, startZ);
                path.add(new THREE.LineCurve3(p1, p2));

                // 2. TRANSITION STRAIGHT 
                const p2_end = new THREE.Vector3(startX, 0.6, startZ + TRANSITION);
                path.add(new THREE.LineCurve3(p2, p2_end));

                // 3. TURN 
                const c1 = new THREE.Vector3(startX, 0.6, startZ + TRANSITION + (TURN_RADIUS * K));
                const p3 = new THREE.Vector3(startX + TURN_RADIUS, 0.6, startZ + TRANSITION + TURN_RADIUS);
                // Note: p3.z SHOULD be `targetStraightZ`.

                const c2 = new THREE.Vector3(
                    (startX + TURN_RADIUS) - (TURN_RADIUS * K),
                    0.6,
                    startZ + TRANSITION + TURN_RADIUS
                );
                path.add(new THREE.CubicBezierCurve3(p2_end, c1, c2, p3));

                // 4. EXTENSION STRAIGHT
                const p4 = new THREE.Vector3(p3.x + branchLength, 0.6, p3.z);
                path.add(new THREE.LineCurve3(p3, p4));

                curves[index] = path;
            }
        });
        return curves;
    }, [trackX, spacing, branchSpacing]);


    // 1. Calculate Max Branch Length for VoxelMap
    const maxBranchLength = useMemo(() => {
        let maxLen = 0;
        Object.keys(branchCurves).forEach(key => {
            const c = branchCurves[parseInt(key)];
            if (c) maxLen = Math.max(maxLen, c.getLength());
        });
        return maxLen;
    }, [branchCurves]);

    // Determine active branch length dynamically
    const activeBranchLength = useMemo(() => {
        if (typeof activeTrack === 'number') {
            return branchCurves[activeTrack]?.getLength() || 1;
        }
        return 1;
    }, [activeTrack, branchCurves]);

    // --- SWITCHING & NAVIGATION LOGIC ---

    const handleEnterBranch = (index: number) => {
        setAligningTo(index);
        setPendingEntry(index);
        setIsReturning(false);
    };

    const handleReturnToMain = () => {
        setIsReturning(true);
    };

    const finalizeReturnToMain = () => {
        setIsReturning(false);
        if (typeof activeTrack === 'number') {
            const returnedFromIndex = activeTrack;

            // 1. Calculate precise re-entry point (Switch Z)
            const mainSignZ = returnedFromIndex * spacing;
            const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;
            const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;

            // 2. Map startZ to main t
            // t = (Z - startZ_World) / Length
            const p1z = TRACK_START_Z;
            const tSwitch = (startZ - p1z) / mainCurveLength;

            // 3. Set Position to Switch
            mainProgress.current = tSwitch;

            // 4. Switch Context to Main
            setActiveTrack('main');
            setCurrentSubIndex(0);

            // 5. Trigger Autopilot to Drive to Station ("Park")
            setPendingEntry(null);
            setAligningTo(returnedFromIndex);
        }
    };

    const handleBranchNext = () => {
        if (typeof activeTrack !== 'number') return;
        const subs = STATION_DATA[activeTrack].subChapters;
        if (!subs) return;
        if (currentSubIndex < subs.length - 1) {
            setCurrentSubIndex(prev => prev + 1);
        }
    };

    const handleBranchPrev = () => {
        if (currentSubIndex > 0) {
            setCurrentSubIndex(prev => prev - 1);
        } else {
            handleReturnToMain();
        }
    };

    const performSwitch = (index: number) => {
        const targetCurve = branchCurves[index];
        if (!targetCurve) return;

        const totalLength = targetCurve.getLength();

        const leadInLength = 9;
        const startT = leadInLength / totalLength;
        branchProgress.current = startT;

        setActiveTrack(index);
        setAligningTo(null);
        setCurrentSubIndex(0);
    };

    // --- BRANCH TARGET CALCULATION ---
    const branchTargetT = useMemo(() => {
        if (typeof activeTrack !== 'number') return null;
        if (isReturning) {
            const totalLength = activeBranchLength;
            const leadInLength = 9;
            return leadInLength / totalLength;
        }

        const setupConfig = LEAD_IN + TRANSITION + (Math.PI * TURN_RADIUS / 2);

        // Target = LeadIn + Transition + Turn + (i+1)*Spacing.
        // Sign X Position should match the Train X.
        // Train X on Straight = TrackX + TURN_RADIUS + LinearDistance.
        // Sign X = TrackX + 5 + (i+1)*BranchSpacing.
        const dist = setupConfig + ((currentSubIndex + 1) * branchSpacing) + 3.05;

        return Math.min(1, dist / activeBranchLength);

    }, [activeTrack, currentSubIndex, activeBranchLength, branchSpacing, isReturning]);


    const currentCurve = activeTrack === 'main' ? curve : branchCurves[activeTrack as number];
    const currentProgress = activeTrack === 'main' ? mainProgress : branchProgress;

    // Inspection Scroll State (for Branches)
    const viewOffset = useRef(0);
    const isBranch = activeTrack !== 'main';

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            {/* Scroll Control */}
            {/* Scroll Control - ENABLED ONLY ON MAIN TRACK */}
            <ScrollControls
                pages={STATION_DATA.length * 1.5}
                damping={0}
                enabled={activeTrack === 'main' && aligningTo === null}
            >
                {/* Render Syncer ALWAYS if on main track, even during autopilot (to sync scrollbar) */}
                {activeTrack === 'main' && (
                    <ScrollSyncer
                        progress={mainProgress}
                        stops={stops}
                        isAutopilot={aligningTo !== null}
                    />
                )}
            </ScrollControls>

            {/* BRANCH SCROLL HANDLER */}
            {isBranch && (
                <BranchScrollHandler
                    viewOffset={viewOffset}
                    isBranch={isBranch}
                    maxOffset={(() => {
                        // Calculate Dynamic Limit based on Current Sign Description
                        if (typeof activeTrack !== 'number') return 12.0;
                        const subs = STATION_DATA[activeTrack]?.subChapters;
                        if (!subs) return 12.0;
                        const currentSub = subs[currentSubIndex];
                        if (!currentSub) return 12.0;

                        const desc = currentSub.desc || "";
                        // Height Calc (Same as StationSign)
                        // signWidth = ~14 (94% of layout). 
                        // Let's assume signWidth approx 14 (safe bet) or check LayoutContext.
                        // Actually LayoutContext provides signWidth. Using usage is cleaner but complicated here.
                        // Let's us hardcoded safe approximate width 14.0.
                        // Height Calc (Must Match StationSign Logic)
                        const frameWidth = 14.0;
                        // Title Logic
                        const titleCharsPerLine = Math.floor((frameWidth - 1.0) * 2.2);
                        const titleLines = Math.ceil((currentSub.label || "").length / Math.max(1, titleCharsPerLine));
                        const titleHeight = titleLines * 0.8;

                        // Desc Logic
                        const charsPerLine = Math.floor((frameWidth - 1.0) * 6.5);
                        const descLines = Math.ceil(desc.length / Math.max(1, charsPerLine));
                        const descHeight = descLines * 0.42;

                        // Total Height
                        const calculatedHeight = 1.0 + titleHeight + 0.5 + descHeight + 1.0;

                        // 3. Calculate Exact Max Offset needed to align Top of Screen with Top of Sign
                        // Formula: Offset = (SignHeight) + Margin + (Gap - StartOffset) - (ScreenHalfHeight)
                        // StartOffset is now dynamic: (vpHeight/2) - 2.0.
                        // So: Height + Margin + Gap - (vpHeight/2 - 2.0) - (vpHeight/2).
                        //   = Height + Margin + Gap - vpHeight/2 + 2.0 - vpHeight/2.
                        //   = Height + Margin + Gap + 2.0 - vpHeight.

                        const SIGN_TRACK_GAP = 5.0;
                        const VIEW_MARGIN = -3.0; // User Set
                        const TRAIN_BOTTOM_MARGIN = 2.0;

                        // Dynamic Start Offset logic from FollowCamera:
                        // CameraZ = TrainZ - (vpHeight/2 - 2.0).
                        // StartOffset = (vpHeight/2) - 2.0.

                        // needed = Height + Margin + Gap - StartOffset - vpHeight/2.
                        //        = Height + Margin + Gap - (vpHeight/2 - 2.0) - vpHeight/2
                        //        = Height + Margin + Gap + 2.0 - vpHeight.

                        const neededOffset = calculatedHeight + VIEW_MARGIN + SIGN_TRACK_GAP + TRAIN_BOTTOM_MARGIN - (isMobile ? 0 : vpHeight);

                        return neededOffset; // Allow Negative
                    })()}
                />
            )}

            {/* Main Autopilot */}
            <AlignmentAutopilot
                targetT={aligningTo !== null ? stops[aligningTo] : null}
                progress={mainProgress}
                curveLength={mainCurveLength}
                speed={25}
                onComplete={() => {
                    if (aligningTo !== null) {
                        if (pendingEntry === aligningTo) {
                            performSwitch(aligningTo);
                        } else {
                            // Just Parking
                            setAligningTo(null);
                        }
                    }
                }}
            />

            {/* Branch Autopilot */}
            {activeTrack !== 'main' && (
                <AlignmentAutopilot
                    targetT={branchTargetT}
                    progress={branchProgress}
                    curveLength={activeBranchLength}
                    speed={20}
                    onComplete={() => {
                        if (isReturning) finalizeReturnToMain();
                    }}
                />
            )}

            <VoxelMap maxBranchLength={maxBranchLength} />

            {/* --- MAIN SIGNS GENERATION --- */}
            {/* We use explicit Z logic now to match Geometry-First principle */}
            {stops.map((t, i) => {
                // 1. Calculate ideal Geometric Z for Main Sign.
                // Based on Grid: index * spacing
                const mainSignZ = i * spacing;

                // We ignore 't' for Z position to ensure grid alignment, 
                // though t-based calc should yield the same result.
                const signPos = new THREE.Vector3(signX, 0.6, mainSignZ);

                const isActiveBranch = activeTrack === i;

                return (
                    <StationSign
                        key={`main-${i}`}
                        position={signPos}
                        label={STATION_DATA[i]?.label}
                        description={STATION_DATA[i]?.desc}
                        width={signWidth}
                        subChapters={STATION_DATA[i]?.subChapters}
                        onEnter={isActiveBranch ? undefined : () => handleEnterBranch(i)}
                    />
                );
            })}

            {/* --- BRANCH SIGNS GENERATION --- */}
            {activeTrack !== 'main' && STATION_DATA[activeTrack as number]?.subChapters?.map((sub, i, arr) => {
                const startX = trackX;

                // GEOMETRY-FIRST ALIGNMENT:
                // Main Sign Z is at `index * spacing`.
                // Branch Track Straight Part is at `index * spacing + SIGN_TRACK_GAP`.
                // Sub-Chapter Signs should maintain the SAME offset from the track.
                // SubSign Z = Track Z - SIGN_TRACK_GAP.
                // Therefore: SubSign Z = (MainSignZ + GAP) - GAP = MainSignZ.

                const mainStationZ = (activeTrack as number) * spacing;
                const subSignZ = mainStationZ; // Identical Z to Main Signs

                // XPos: TrackX + Radius(5) + Spacing*(i+1)
                const sX = startX + 5 + ((i + 1) * branchSpacing);
                const pos = new THREE.Vector3(sX, 0.6, subSignZ);

                const isCurrent = i === currentSubIndex;
                const isLast = i === arr.length - 1;

                return (
                    <StationSign
                        key={`branch-${i}`}
                        position={pos}
                        label={sub.label}
                        description={sub.desc}
                        width={signWidth}
                        currentSubIndex={i}
                        onNext={isCurrent && !isLast ? handleBranchNext : undefined}
                        onPrev={isCurrent ? handleBranchPrev : undefined}
                        onReturn={isCurrent && isLast ? handleReturnToMain : undefined}
                    />
                )
            })}


            <Train curve={currentCurve} position={new THREE.Vector3(0, 0.8, 0)} progress={currentProgress} />

            {/* Main Track */}
            <TrackSystem curve={curve} />

            {/* Branch Tracks */}
            {Object.values(branchCurves).map((branchCurve, i) => (
                <TrackSystem key={i} curve={branchCurve} debug={false} />
            ))}

            {/* --- BUFFER STOPS --- */}

            {/* 1. Main Track Start (Facing +Z, towards train) */}
            <BufferStop
                position={new THREE.Vector3(trackX, 0.6, TRACK_START_Z)}
                rotation={new THREE.Euler(0, 0, 0)}
            />

            {/* 2. Main Track End (Facing -Z, towards incoming train) */}
            {/* Main curve end point defined in curve useMemo: trackLength + 10 */}
            <BufferStop
                position={new THREE.Vector3(trackX, 0.6, trackLength + 10)}
                rotation={new THREE.Euler(0, Math.PI, 0)}
            />

            {/* 3. Branch Ends */}
            {Object.entries(branchCurves).map(([key, bCurve]) => {
                const endPoint = bCurve.getPoint(1);
                // Calculate Rotation: Face AGAINST the tangent
                // Tangent at end (t=1)
                const tangent = bCurve.getTangent(1);
                // Angle of tangent
                const angle = Math.atan2(tangent.x, tangent.z);
                // We want Local Z (Red Lights) to face -Tangent.
                // -Tangent angle = angle + PI.
                const rotY = angle + Math.PI;

                return (
                    <BufferStop
                        key={`buffer-branch-${key}`}
                        position={endPoint}
                        rotation={new THREE.Euler(0, rotY, 0)}
                    />
                );
            })}

            <FollowCamera
                curve={currentCurve}
                progress={currentProgress}
                isBranch={activeTrack !== 'main'}
                baseY={cameraY}
                offsetZ={viewOffset}
            />
        </>
    );
}

// --- SCROLL SYNC ---
function ScrollSyncer({ progress, stops, isAutopilot }: { progress: React.MutableRefObject<number>, stops: number[], isAutopilot: boolean }) {
    const scroll = useScroll();
    const startT = stops[0];
    const endT = stops[stops.length - 1];
    const range = endT - startT;



    useFrame(() => {
        if (isAutopilot) {
            // AUTO: Progress -> Scroll
            const currentOffset = (progress.current - startT) / range;
            scroll.offset = currentOffset;
            if (scroll.el) {
                const targetScrollTop = currentOffset * (scroll.el.scrollHeight - scroll.el.clientHeight);
                scroll.el.scrollTop = targetScrollTop;
            }
        } else {
            // MANUAL: Scroll -> Progress
            progress.current = startT + scroll.offset * range;
        }
    }, -2);

    return null;
}

// --- BRANCH SCROLL HANDLER (WHEEL/TOUCH) ---
function BranchScrollHandler({ viewOffset, isBranch, maxOffset }: { viewOffset: React.MutableRefObject<number>, isBranch: boolean, maxOffset: number }) {
    const { gl } = useThree();

    useEffect(() => {
        if (!isBranch) {
            viewOffset.current = 0;
            return;
        }

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Scroll Down (e.deltaY > 0) -> Move Camera Up (Increase Offset) -> See Higher parts of sign
            // Sensitivity
            const speed = 0.02;
            viewOffset.current -= e.deltaY * speed;
            viewOffset.current = Math.max(0, Math.min(viewOffset.current, maxOffset));
        };

        const handleTouchStartRaw = (e: TouchEvent) => {
            // Prevent default to stop pull-to-refresh etc?
            // e.preventDefault();
        };

        // For simple vertical drag:
        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            // e.preventDefault(); // active listener
            const y = e.touches[0].clientY;
            const deltaY = touchStartY - y; // Drag Up = Positive
            touchStartY = y;

            const speed = 0.05;
            viewOffset.current -= deltaY * speed;
            viewOffset.current = Math.max(0, Math.min(viewOffset.current, maxOffset));
        };

        const target = window; // Use window to catch all events regardless of overlays

        target.addEventListener('wheel', handleWheel, { passive: false });
        target.addEventListener('touchstart', handleTouchStart, { passive: false }); // Passive false to block scroll
        target.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            target.removeEventListener('wheel', handleWheel);
            target.removeEventListener('touchstart', handleTouchStart);
            target.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isBranch, maxOffset, gl, viewOffset]);

    return null;
}