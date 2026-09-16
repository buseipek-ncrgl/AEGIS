namespace Aegis.Domain.Enums;

public enum AnomalyType
{
    GpsSpoofing = 1,          // GPS Sinyal Manipülasyonu / Işık Hızı Sıçraması
    SuddenAltitudeDrop = 2,   // Ani İrtifa Düşüşü / Serbest Düşüş
    ThermalRunaway = 3,       // Kontrolsüz Motor/Batarya Isınması
    UnusualSpeedSpike = 4     // Fiziksel Sınır Dışı Anormal Hız Artışı
}
