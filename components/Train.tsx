"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * ==================================================================================================
 * POCIĄG VOKSELOWY (Styl Kolei Wielkopolskich - "Elf"/"Impuls")
 * ==================================================================================================
 * 
 * JAK CZYTAĆ TEN KOD?
 * 1. Pociąg zbudowany jest z "grup" (<group>) i "siatek" (<mesh> - czyli klocków).
 * 2. <group> to kontener. Jak przesuwamy grupę, przesuwa się wszystko w środku.
 * 3. Pozycje [x, y, z]:
 *    - X: Długość pociągu (przód/tył). X dodatnie to PRZÓD.
 *    - Y: Wysokość (góra/dół).
 *    - Z: Szerokość (lewo/prawo).
 * 4. Wymiary args={[szerokość, wysokość, głębokość]}
 * 
 * EDYCJA KOLORÓW:
 * Możesz zmieniać stałe poniżej (C_RED, C_WHITE itp.), aby zmienić malowanie całego pociągu.
 */

// --- PALETA KOLORÓW ---
const C_RED = "#e74c3c";        // Jasny czerwony (nos, detale)
const C_DARK_RED = "#c0392b";   // Ciemny czerwony (dolny pas)
const C_WHITE = "#ecf0f1";      // Biały (główny korpus)
const C_DARK_GREY = "#2c3e50";  // Ciemnoszary (okna, podwozie, zgarniacz)
const C_BLACK = "#1a1a1a";      // Czarny (uszczelki, słupki)
const C_YELLOW = "#f1c40f";     // Żółty (światła)
const C_GREY_LIGHT = "#bdc3c7"; // Jasnoszary (dach techniczny)
const C_WHEEL_METAL = "#111";   // Kolor kół

export function Train() {
    // Referencja do całego pociągu (żebyśmy mogli nim ruszać w kodzie JS)
    const groupRef = useRef<THREE.Group>(null);

    // Pętla animacji (wykonuje się ~60 razy na sekundę)
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Przesuwanie pociągu w osi X
        groupRef.current.position.x += 2 * delta; // Prędkość: 2 jednostki/s

        // Pętla toru: Jak odjedzie za daleko (x > 10), cofnij go na początek (x = -10)
        if (groupRef.current.position.x > 10) {
            groupRef.current.position.x = -10;
        }
    });

    return (
        // GŁÓWNA GRUPA POCIĄGU
        // Podniesiona o 2.6 w górę, żeby koła stały na torach (które będą na poziomie 1-2)
        <group ref={groupRef} position={[0, 2.6, 0]}>

            {/* =========================================================================
                CZĘŚĆ 1: KORPUS PASAŻERSKI (To duże białe pudło z tyłu)
                Pozycja: Przesunięta lekko w tył (-0.5), żeby zrobić miejsce na nos
                ========================================================================= */}
            <group position={[-0.5, 0, 0]}>

                {/* 1. PODWOZIE (Szary spód) */}
                <mesh position={[0, -0.4, 0]}>
                    {/* args: długość 2.5, wysokość 0.2, szerokość 0.7 */}
                    <boxGeometry args={[2.5, 0.2, 0.7]} />
                    <meshStandardMaterial color={C_DARK_GREY} />
                </mesh>

                {/* 2. DOLNY PAS (Czerwony) - leży na podwoziu */}
                <mesh position={[0, -0.2, 0]}>
                    <boxGeometry args={[2.5, 0.2, 0.8]} />
                    <meshStandardMaterial color={C_DARK_RED} />
                </mesh>

                {/* 3. ŚCIANA GŁÓWNA (Biała) - serce wagonu */}
                <mesh position={[0, 0.3, 0]}>
                    <boxGeometry args={[2.5, 0.8, 0.8]} />
                    <meshStandardMaterial color={C_WHITE} />
                </mesh>

                {/* 4. OKNA (Ciemne pasy na bokach) */}
                {/* Uwaga: Są minimalnie szersze (0.82) niż ściana (0.8), żeby "wystawały" */}
                {/* Okno Tylne */}
                <mesh position={[-0.8, 0.3, 0]}>
                    <boxGeometry args={[0.5, 0.35, 0.82]} />
                    <meshStandardMaterial color={C_BLACK} roughness={0.2} />
                </mesh>
                {/* Okno Środkowe */}
                <mesh position={[0, 0.3, 0]}>
                    <boxGeometry args={[0.8, 0.35, 0.82]} />
                    <meshStandardMaterial color={C_BLACK} roughness={0.2} />
                </mesh>
                {/* Okno Przednie */}
                <mesh position={[0.8, 0.3, 0]}>
                    <boxGeometry args={[0.5, 0.35, 0.82]} />
                    <meshStandardMaterial color={C_BLACK} roughness={0.2} />
                </mesh>

                {/* 5. DACH (Dwuwarstwowy dla zaokrąglenia) */}
                {/* Warstwa szersza (Biała) */}
                <mesh position={[0.25, 0.75, 0]}>
                    <boxGeometry args={[3.0, 0.1, 0.7]} />
                    <meshStandardMaterial color={C_WHITE} />
                </mesh>
                {/* Warstwa węższa na samej górze (Szara techniczna) */}
                <mesh position={[0.25, 0.82, 0]}>
                    <boxGeometry args={[3.0, 0.05, 0.5]} />
                    <meshStandardMaterial color={C_GREY_LIGHT} />
                </mesh>
                {/* Aparatura na dachu (np. klima/oporniki) */}
                <mesh position={[-0.5, 0.9, 0]}>
                    <boxGeometry args={[0.6, 0.15, 0.3]} />
                    <meshStandardMaterial color={C_DARK_GREY} />
                </mesh>
            </group>


            {/* =========================================================================
                CZĘŚĆ 2: NOS (KABINA MASZYNISTY)
                Pozycja: Przesunięta w prawo (1.0), żeby stykała się z korpusem
                Budowa: "Schodkowa", żeby symulować opływowy kształt
                ========================================================================= */}
            <group position={[1.0, 0, 0]}>

                {/* --- SEKCJA A: ŁĄCZNIK (Styk z pociągiem) --- */}
                {/* Wypełnienie podwozia pod drzwiami (Czerwone + Szare) */}
                <mesh position={[0, -0.2, 0]}>
                    <boxGeometry args={[0.5, 0.2, 0.8]} />
                    <meshStandardMaterial color={C_DARK_RED} />
                </mesh>
                <mesh position={[0, -0.4, 0]}>
                    <boxGeometry args={[0.5, 0.2, 0.7]} />
                    <meshStandardMaterial color={C_DARK_GREY} />
                </mesh>

                {/* Biała ściana i drzwi */}
                <mesh position={[0, 0.3, 0]}>
                    <boxGeometry args={[0.5, 0.8, 0.8]} />
                    <meshStandardMaterial color={C_WHITE} />
                </mesh>
                <mesh position={[0, 0.3, 0]}>
                    <boxGeometry args={[0.3, 0.6, 0.82]} />
                    <meshStandardMaterial color={C_BLACK} />
                </mesh>

                {/* --- SEKCJA B: POCZĄTEK SKOSU (Pierwszy schodek nosa) --- */}
                {/* Czerwony blok nosa */}
                <mesh position={[0.4, 0.25, 0]}>
                    <boxGeometry args={[0.4, 0.75, 0.78]} />
                    <meshStandardMaterial color={C_RED} />
                </mesh>
                {/* Wypełnienie dziury pod spodem (o to prosiłeś - naprawione!) */}
                <mesh position={[0.4, -0.15, 0]}>
                    <boxGeometry args={[0.5, 0.3, 0.75]} />
                    <meshStandardMaterial color={C_RED} />
                </mesh>
                {/* Szyba przednia (Górna część) */}
                <mesh position={[0.35, 0.65, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.76]} />
                    <meshStandardMaterial color={C_BLACK} roughness={0.1} />
                </mesh>


                {/* --- SEKCJA C: ŚRODEK NOSA (Drugi schodek) --- */}
                {/* To jest ten "drugi czerwony segment od przodu" */}
                <mesh position={[0.75, 0.1, 0]}>
                    <boxGeometry args={[0.4, 0.6, 0.75]} />
                    <meshStandardMaterial color={C_RED} />
                </mesh>
                {/* FIX: ŁATA pod drugim segmentem (Wypełnia pustkę nad zgarniaczem) */}
                <mesh position={[0.75, -0.225, 0]}>
                    <boxGeometry args={[0.4, 0.15, 0.75]} />
                    <meshStandardMaterial color={C_RED} />
                </mesh>
                {/* Szyba przednia (Dolna część) */}
                <mesh position={[0.55, 0.45, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.74]} />
                    <meshStandardMaterial color={C_BLACK} roughness={0.1} />
                </mesh>


                {/* --- SEKCJA D: SZPIC (Sam przód) --- */}
                <mesh position={[1.05, -0.1, 0]}>
                    <boxGeometry args={[0.3, 0.4, 0.7]} />
                    <meshStandardMaterial color={C_RED} />
                </mesh>

                {/* ZGARNIACZ (Szary element na samym dole chroniący koła) */}
                <mesh position={[0.75, -0.35, 0]}>
                    {/* Wydłużyłem go trochę w lewo (do 0.9), żeby stykał się z podwoziem */}
                    <boxGeometry args={[1.0, 0.15, 0.6]} />
                    <meshStandardMaterial color={C_DARK_GREY} />
                </mesh>
                {/* Wystający "zderzak" na czubku */}
                <mesh position={[1.25, -0.3, 0]}>
                    <boxGeometry args={[0.2, 0.15, 0.4]} />
                    <meshStandardMaterial color={C_DARK_GREY} />
                </mesh>

                {/* --- ŚWIATŁA --- */}
                {/* Wystają fizycznie przed nos (pozycja X=1.1, podczas gdy szpic jest X=1.05) */}
                {/* Lewe */}
                <mesh position={[1.1, -0.05, 0.25]}>
                    <boxGeometry args={[0.1, 0.1, 0.15]} />
                    <meshStandardMaterial color={C_YELLOW} emissive={C_YELLOW} emissiveIntensity={2} />
                </mesh>
                {/* Prawe */}
                <mesh position={[1.1, -0.05, -0.25]}>
                    <boxGeometry args={[0.1, 0.1, 0.15]} />
                    <meshStandardMaterial color={C_YELLOW} emissive={C_YELLOW} emissiveIntensity={2} />
                </mesh>
            </group>


            {/* =========================================================================
                CZĘŚĆ 3: KOŁA (WÓZKI JEZDNE)
                Używamy gotowego komponentu <Bogie> zdefiniowanego na dole pliku.
                ========================================================================= */}
            {/* Wózek Przedni (Pod kabiną) */}
            <Bogie position={[0.8, -0.6, 0]} />

            {/* Wózek Tylny (Pod końcem wagonu) */}
            <Bogie position={[-1.2, -0.6, 0]} />

        </group>
    )
}

/**
 * KOMPONENT POMOCNICZY: WÓZEK JEZDNY (Bogie)
 * Zamiast pisać ten sam kod dwa razy, tworzymy funkcję (klocka), 
 * którego używamy wielokrotnie w pociągu.
 */
function Bogie({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* OŚ 1 (Przednia) */}
            <mesh position={[0.25, 0, 0.25]}>
                <boxGeometry args={[0.2, 0.2, 0.15]} />
                <meshStandardMaterial color={C_WHEEL_METAL} />
            </mesh>
            <mesh position={[0.25, 0, -0.25]}>
                <boxGeometry args={[0.2, 0.2, 0.15]} />
                <meshStandardMaterial color={C_WHEEL_METAL} />
            </mesh>

            {/* OŚ 2 (Tylna) */}
            <mesh position={[-0.25, 0, 0.25]}>
                <boxGeometry args={[0.2, 0.2, 0.15]} />
                <meshStandardMaterial color={C_WHEEL_METAL} />
            </mesh>
            <mesh position={[-0.25, 0, -0.25]}>
                <boxGeometry args={[0.2, 0.2, 0.15]} />
                <meshStandardMaterial color={C_WHEEL_METAL} />
            </mesh>

            {/* RAMA WÓZKA (Łączy koła) */}
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.8, 0.1, 0.5]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
}