import traceback
import sys
import os
import pyautogui
import pyperclip
import time
import threading

# Use pynput for global keyboard hooks (more reliable on Windows)
try:
    from pynput import keyboard as pynput_keyboard
except ImportError:
    with open("bot_error_import.log", "w") as f:
        f.write("pynput module not found. Install with: pip install pynput\n")
    sys.exit(1)

# Also import keyboard for typing (different purpose)
try:
    import keyboard
except ImportError:
    keyboard = None

# Debug Log
def log(msg):
    try:
        with open("bot_debug.log", "a", encoding="utf-8") as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    except:
        pass

log("Script Started")

# Global stop flag
stop_requested = False

def on_key_press(key):
    global stop_requested
    try:
        if key == pynput_keyboard.Key.f4:
            log("🛑 ACİL DURDURMA: F4 tuşuna basıldı.")
            print("\n🛑 ACİL DURDURMA: F4 tuşuna basıldı. Bot kapatılıyor...")
            stop_requested = True
            os._exit(0)
    except:
        pass

# Start keyboard listener in background thread
listener = pynput_keyboard.Listener(on_press=on_key_press)
listener.start()
log("F4 Hotkey listener started with pynput")

sayac = 0
sayi = 5
if len(sys.argv) > 1:
    try:
        sayi = int(sys.argv[1])
        log(f"Count received from args: {sayi}")
    except:
        pass

for i in range(sayi):
    sys.stdout.flush() # Ensure print is flushed
    sayac += 1
    #print(sayac)
    print(i + 1)
    pyautogui.leftClick(1454, 412, duration=0.5)
    for i in range(10):
        pyautogui.scroll(-9999999)

    # kişi ismine tıkla
    pyautogui.leftClick(1273, 974)

    # mesajlar
    pyautogui.leftClick(1700, 985)
    pyperclip.copy( "4 GÜNLÜK MUHTEŞEM DETOKS listeniz burada 🥳🥳🥳\n *DETOKS İÇECEK TARİFİNİ GRUPTA VERİRİM*\n Spor Programımızda olacak hergün egzersizleri gruptan paylaşacağım \n YARIN GÜZEL BİR ENERJİLE BAŞLİYORUZ \n *GRUBU OLABİLDİĞİNCE AKTİF TUTUP MOTİVASYONU BERABER SAĞLAYALIM AYRICA ÖZELDEKİ TAKİP MESAJLARINA DA DÖNÜŞ YAPIN Kİ EKSİK YADA YANLIŞ BİRŞEY VARSA DÜZELTELİM GÜZEL BİR SONUÇ ALALIM* \n\n *İNSTAGRAM VE YOUTUBE KANALIMIZI TAKİP ETMEYİ UNUTMAYIN HER HAFTA YENİ KAMPANYALARIMIZ OLUYOR*\n\nGüzel sonuçlar almak dileğiyle ")
    pyautogui.hotkey("ctrl", "v")
    time.sleep(1)

    pyautogui.press('enter')
    pyautogui.press('enter')
    time.sleep(1)

    """
    # Detoks içecek
    pyperclip.copy("🍶 İÇECEK TARİF YOUTUBE VİDEOSU BURADA \n *KANALIMIZI TAKİP ETMEYİ UNUTMAYIN LÜTFEN* \n 👇👇👇 \n https://youtu.be/4E1gzsz9HSY")
    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.4)

    pyautogui.press('enter')
    pyautogui.press('enter')
    time.sleep(1)
    """
    pyautogui.leftClick(1655, 81, duration=0.5)
    time.sleep(1)



    # kişi ismi 2.adım
    pyautogui.moveTo(1692, 340, duration=0.5)
    pyautogui.click()
    pyautogui.click()
    pyautogui.click()
    pyautogui.hotkey('ctrl', 'c')
    time.sleep(0.3)
    pyautogui.hotkey('ctrl', 'c')

    isim = pyperclip.paste()
    kisi_ismi = isim.upper()
    time.sleep(0.5)

    # menu kapat buttonu
    pyautogui.hotkey('esc')
    time.sleep(0.5)

    # dosya kordinatı
    pyautogui.moveTo(45, 825, duration=0.5)
    pyautogui.click()
    pyautogui.press('f2')
    time.sleep(0.7)
    keyboard.write(kisi_ismi[4:])
    pyautogui.press('enter')
    time.sleep(0.5)

    # Başlangıç koordinatları - sürüklemeye başlamak istediğiniz yer
    start_x, start_y = 45, 825
    # Bitiş koordinatları - sürüklemeyi bitirmek istediğiniz yer
    end_x, end_y = 1635, 763
    pyautogui.moveTo(start_x, start_y)
    pyautogui.mouseDown()
    time.sleep(0.5)
    pyautogui.moveTo(end_x, end_y, duration=1)
    pyautogui.mouseUp()

    #marketalışveriş
    #    start_x, start_y = 48, 900
    # Bitiş koordinatları - sürüklemeyi bitirmek istediğiniz yer
    #    end_x, end_y = 1535, 763
    # pyautogui.moveTo(start_x, start_y)
    #pyautogui.mouseDown()
    #time.sleep(0.5)

    pyautogui.moveTo(end_x, end_y, duration=1)
    pyautogui.mouseUp()
    time.sleep(0.5)
    pyperclip.copy("👉DETOKS LİSTE PDF DOSYASI BURADA")
    pyautogui.hotkey("ctrl", "v")

    time.sleep(1.5)
    pyautogui.leftClick(1860, 960, duration=0.5)
    #pyautogui.press('enter')
    time.sleep(1)

