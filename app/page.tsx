
"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { VoxelMap } from "../components/VoxelMap";
import { Train } from "../components/Train";
import { TrackSystem } from "../components/TrackSystem";
import * as THREE from "three";
import { useRef, useMemo, useState, Suspense } from "react";
import { FollowCamera } from "../components/FollowCamera";
import { StationSign } from "../components/StationSign";
import { ScrollControls } from "@react-three/drei";
import { LayoutProvider, useLayout } from "../components/LayoutContext";
import { BufferStop } from "../components/BufferStop";
import { ScrollSyncer } from "../components/ScrollSyncer";
import { BranchScrollHandler } from "../components/BranchScrollHandler";
import { AlignmentAutopilot } from "../components/AlignmentAutopilot";

// Note: STATION_DATA could be moved to a separate data file (e.g. data/stations.ts) in a real project
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
            { label: "Oferta edukacyjna", desc: "W ramach kształcenia językowego uczniowie kontynuują naukę obowiązkowego języka angielskiego oraz dodatkowego języka niemieckiego. Przydział do odpowiednich grup nastąpi na podstawie testów poziomujących z obu języków, które odbędą się dla wszystkich uczniów klas pierwszych podczas spotkań z wychowawcami. Przedmiotem realizowanym w zakresie rozszerzonym jest matematyka, natomiast do przedmiotów punktowanych należą język obcy nowożytny oraz fizyka. Tok nauczania prowadzi do zdobycia dwóch kwalifikacji zawodowych: ELM.02 (Montaż oraz instalowanie układów i urządzeń elektronicznych) oraz ELM.05 (Eksploatacja urządzeń elektronicznych)." },
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

// Configuration for geometry and track layout
const TURN_RADIUS = 5;
const TRANSITION = 3;
const SIGN_TRACK_GAP = 5;
const BEZIER_K = 0.55228475; // Approximation for quarter-circle
const LEAD_IN = 9;
const TRACK_START_Z = -10;

export default function Home() {
    return (
        <main className="relative w-screen h-screen overflow-hidden bg-stone-100">
            {/* UI Portal Target */}
            <div id="ui-portal" className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex items-center justify-center" />

            <Canvas camera={{ position: [0, 16, 0], fov: 50 }} shadows>
                <ambientLight intensity={0.7} color="#ffffff" />
                <directionalLight
                    position={[15, 20, 10]}
                    intensity={0.7}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-bias={-0.0001}
                    color="#fffaf0"
                />
                <directionalLight position={[-15, 10, -10]} intensity={0.1} color="#e0f0ff" />
                {/* Additional fill light restored */}
                <directionalLight position={[10, 10, 5]} intensity={0.5} />

                <Suspense fallback={null}>
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

    // Spacing between branch sub-chapter signs
    const branchSpacing = signWidth * 2;

    // --- State Management ---
    const [activeTrack, setActiveTrack] = useState<'main' | number>('main');
    const [aligningTo, setAligningTo] = useState<number | null>(null);
    const [currentSubIndex, setCurrentSubIndex] = useState(0);
    const [isReturning, setIsReturning] = useState(false);
    const [pendingEntry, setPendingEntry] = useState<number | null>(null);

    // Progress Refs
    const mainProgress = useRef(0);
    const branchProgress = useRef(0);
    const viewOffset = useRef(0); // For branch sign scrolling

    const isBranch = activeTrack !== 'main';

    // --- curve Generation ---
    const curve = useMemo(() => {
        const points = [
            new THREE.Vector3(trackX, 0.6, TRACK_START_Z),
            new THREE.Vector3(trackX, 0.6, trackLength + 10),
        ];
        return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    }, [trackX, trackLength]);

    const mainCurveLength = useMemo(() => curve.getLength(), [curve]);

    const stops = useMemo(() => {
        const arr = [];
        const realCurveLength = mainCurveLength;
        for (let i = 0; i < STATION_DATA.length; i++) {
            const zPos = i * spacing;
            const t = Math.max(0, Math.min(1, (zPos - TRACK_START_Z) / realCurveLength));
            arr.push(t);
        }
        return arr;
    }, [curve, spacing, mainCurveLength]);

    const branchCurves = useMemo(() => {
        const curves: { [key: number]: THREE.Curve<THREE.Vector3> } = {};

        STATION_DATA.forEach((station, index) => {
            if (station.subChapters && station.subChapters.length > 0) {
                const startX = trackX;
                const mainSignZ = index * spacing;
                const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;
                const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;
                const totalXDist = (station.subChapters.length) * branchSpacing;
                const branchLength = totalXDist + 10;

                const path = new THREE.CurvePath<THREE.Vector3>();

                // Segment 1: Lead-in
                path.add(new THREE.LineCurve3(
                    new THREE.Vector3(startX, 0.6, startZ - LEAD_IN),
                    new THREE.Vector3(startX, 0.6, startZ)
                ));

                // Segment 2: Transition
                const p2 = new THREE.Vector3(startX, 0.6, startZ);
                const p2_end = new THREE.Vector3(startX, 0.6, startZ + TRANSITION);
                path.add(new THREE.LineCurve3(p2, p2_end));

                // Segment 3: Turn (Cubic Bezier)
                const c1 = new THREE.Vector3(startX, 0.6, startZ + TRANSITION + (TURN_RADIUS * BEZIER_K));
                const p3 = new THREE.Vector3(startX + TURN_RADIUS, 0.6, startZ + TRANSITION + TURN_RADIUS);
                const c2 = new THREE.Vector3(p3.x - (TURN_RADIUS * BEZIER_K), 0.6, p3.z);
                path.add(new THREE.CubicBezierCurve3(p2_end, c1, c2, p3));

                // Segment 4: Extension
                const p4 = new THREE.Vector3(p3.x + branchLength, 0.6, p3.z);
                path.add(new THREE.LineCurve3(p3, p4));

                curves[index] = path;
            }
        });
        return curves;
    }, [trackX, spacing, branchSpacing]);

    // Active track helpers
    const activeBranchLength = useMemo(() => {
        if (typeof activeTrack === 'number') {
            return branchCurves[activeTrack]?.getLength() || 1;
        }
        return 1;
    }, [activeTrack, branchCurves]);

    const maxBranchLength = useMemo(() => {
        let maxLen = 0;
        Object.values(branchCurves).forEach(c => maxLen = Math.max(maxLen, c.getLength()));
        return maxLen;
    }, [branchCurves]);

    // --- Navigation Logic ---
    const handleEnterBranch = (index: number) => {
        setAligningTo(index);
        setPendingEntry(index);
        setIsReturning(false);
    };

    const handleReturnToMain = () => setIsReturning(true);

    const finalizeReturnToMain = () => {
        setIsReturning(false);
        if (typeof activeTrack === 'number') {
            const returnedFromIndex = activeTrack;
            const mainSignZ = returnedFromIndex * spacing;
            const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;
            const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;
            const tSwitch = (startZ - TRACK_START_Z) / mainCurveLength;

            mainProgress.current = tSwitch;
            setActiveTrack('main');
            setCurrentSubIndex(0);
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
        const startT = LEAD_IN / totalLength;
        branchProgress.current = startT;

        setActiveTrack(index);
        setAligningTo(null);
        setCurrentSubIndex(0);
    };

    const branchTargetT = useMemo(() => {
        if (typeof activeTrack !== 'number') return null;
        if (isReturning) {
            return LEAD_IN / activeBranchLength;
        }
        const setupConfig = LEAD_IN + TRANSITION + (Math.PI * TURN_RADIUS / 2);
        const dist = setupConfig + ((currentSubIndex + 1) * branchSpacing) + 3.05;
        return Math.min(1, dist / activeBranchLength);
    }, [activeTrack, currentSubIndex, activeBranchLength, branchSpacing, isReturning]);

    const currentCurve = activeTrack === 'main' ? curve : branchCurves[activeTrack as number];
    const currentProgress = activeTrack === 'main' ? mainProgress : branchProgress;

    // --- View Max Offset Calculation ---
    // Calculates how far we can scroll down on a branch sign
    const branchMaxOffset = useMemo(() => {
        if (typeof activeTrack !== 'number') return 12.0;
        const subs = STATION_DATA[activeTrack]?.subChapters;
        if (!subs) return 12.0;
        const currentSub = subs[currentSubIndex];
        if (!currentSub) return 12.0;

        const desc = currentSub.desc || "";
        const frameWidth = 14.0; // Approximation
        const titleCharsPerLine = Math.floor((frameWidth - 1.0) * 2.2);
        const titleLines = Math.ceil((currentSub.label || "").length / Math.max(1, titleCharsPerLine));
        const titleHeight = titleLines * 0.8;

        const charsPerLine = Math.floor((frameWidth - 1.0) * 6.5);
        const descLines = Math.ceil(desc.length / Math.max(1, charsPerLine));
        const descHeight = descLines * 0.42;

        const calculatedHeight = 1.0 + titleHeight + 0.5 + descHeight + 1.0;
        const VIEW_MARGIN = -3.0; // Adjustable
        const TRAIN_BOTTOM_MARGIN = 2.0;

        return calculatedHeight + VIEW_MARGIN + SIGN_TRACK_GAP + TRAIN_BOTTOM_MARGIN - (isMobile ? 0 : vpHeight);
    }, [activeTrack, currentSubIndex, isMobile, vpHeight]);

    return (
        <>
            {/* --- Scroll Controls & Handlers --- */}
            <ScrollControls
                pages={STATION_DATA.length * 1.5}
                damping={0}
                enabled={activeTrack === 'main' && aligningTo === null}
            >
                {activeTrack === 'main' && (
                    <ScrollSyncer
                        progress={mainProgress}
                        stops={stops}
                        isAutopilot={aligningTo !== null}
                    />
                )}
            </ScrollControls>

            {isBranch && (
                <BranchScrollHandler
                    viewOffset={viewOffset}
                    isBranch={isBranch}
                    maxOffset={branchMaxOffset}
                />
            )}

            {/* --- Autopilots --- */}
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
                            setAligningTo(null);
                        }
                    }
                }}
            />

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

            {/* --- Environment --- */}
            <VoxelMap maxBranchLength={maxBranchLength} />

            {/* --- Signs --- */}
            {stops.map((t, i) => {
                const mainSignZ = i * spacing;
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

            {activeTrack !== 'main' && STATION_DATA[activeTrack as number]?.subChapters?.map((sub, i, arr) => {
                const startX = trackX;
                const mainStationZ = (activeTrack as number) * spacing;
                const sX = startX + 5 + ((i + 1) * branchSpacing);
                const pos = new THREE.Vector3(sX, 0.6, mainStationZ);
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

            {/* --- Tracks & Trains --- */}
            <Train curve={currentCurve} position={new THREE.Vector3(0, 0.8, 0)} progress={currentProgress} />
            <TrackSystem curve={curve} />
            {Object.values(branchCurves).map((branchCurve, i) => (
                <TrackSystem key={i} curve={branchCurve} debug={false} renderSkip={LEAD_IN + 3} />
            ))}

            {/* --- Buffer Stops --- */}
            {/* Main Start */}
            <BufferStop
                position={new THREE.Vector3(trackX, 0.6, TRACK_START_Z)}
                rotation={new THREE.Euler(0, 0, 0)}
            />
            {/* Main End */}
            <BufferStop
                position={new THREE.Vector3(trackX, 0.6, trackLength + 10)}
                rotation={new THREE.Euler(0, Math.PI, 0)}
            />
            {/* Branch Ends */}
            {Object.entries(branchCurves).map(([key, bCurve]) => {
                const endPoint = bCurve.getPoint(1);
                const tangent = bCurve.getTangent(1);
                const angle = Math.atan2(tangent.x, tangent.z);
                return (
                    <BufferStop
                        key={`buffer-branch-${key}`}
                        position={endPoint}
                        rotation={new THREE.Euler(0, angle + Math.PI, 0)}
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