//==============================================================
/*                                                            *
 *  always keep sorted alphabetically, when adding new locale *
 *                                                            */
//==============================================================

/**
 * @typedef {object} i18nType
 * @property {string[]} days
 * @property {string[]} daysShort
 * @property {string[]} daysMin
 * @property {string[]} months
 * @property {string[]} monthsShort
 * @property {string[]} meridiem
 * @property {string[]} suffix
 * @property {string} todayBtn
 * @property {string} clearBtn
 * @property {string} okBtn
 * @property {string} cancelBtn
 * @property {string} timeView
 * @property {string} backToDate
*/

/**
 * @type {i18nType} Arabic translation by Amine Laaraf
 */
export const ar_DZ = {
  days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
  daysShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد'],
  daysMin: ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'],
  months: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthsShort: ['جان', 'فيف', 'مار', 'أفر', 'ماي', 'جوا', 'جوي', 'أوت', 'سبت', 'أكت', 'نوف', 'ديس'],
  meridiem: ['صباح', 'مساء'],
  suffix: ['', '', '', ''],
  todayBtn: 'اليوم',
  clearBtn: 'مسح',
  okBtn: 'تأكيد',
  cancelBtn: 'إلغاء',
  timeView: 'عرض الوقت',
  backToDate: 'العودة إلى عرض التقويم'
};

export const ar_MR = {
  days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
  daysShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد'],
  daysMin: ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'],
  months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
  monthsShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'غش', 'شت', 'أكت', 'نون', 'دج'],
  meridiem: ['صباح', 'مساء'],
  suffix: ['', '', '', ''],
  todayBtn: 'اليوم',
  clearBtn: 'مسح',
  okBtn: 'تأكيد',
  cancelBtn: 'إلغاء',
  timeView: 'عرض الوقت',
  backToDate: 'العودة إلى عرض التقويم'
};

export const ar_YE = {
  days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
  daysShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد'],
  daysMin: ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'],
  months: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthsShort: ['ينا', 'فبر', 'مار', 'إبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
  meridiem: ['صباح', 'مساء'],
  suffix: ['', '', '', ''],
  todayBtn: 'اليوم',
  clearBtn: 'مسح',
  okBtn: 'تأكيد',
  cancelBtn: 'إلغاء',
  timeView: 'عرض الوقت',
  backToDate: 'العودة إلى عرض التقويم'
}

/**
 * @type {i18nType} Czech translation
 */
export const cz = {
  days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  daysMin:     ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
  months:      ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
  monthsShort: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čer', 'Srp', 'Zář', 'Říj', 'List', 'Pro'],
  meridiem:    ['am', 'pm'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  todayBtn:    'Dnes',
  clearBtn:    'Smazat',
  okBtn:       'Ok',
  cancelBtn:   'Zrušit',
  timeView:    'Zobrazit hodiny',
  backToDate:  'Zpátky na kalendář'
}

/**
 * @type {i18nType} German translation by emroc GmbH
 */
export const de = {
  days:        ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
  daysShort:   ['Son', 'Mon', 'Die', 'Mie', 'Don', 'Fre', 'Sam', 'Son'],
  daysMin:     ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  months:      ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  meridiem:    ['am', 'pm'],
  suffix:      ['', '', '', ''],
  todayBtn:    'Heute',
  clearBtn:    'Zurücksetzen',
  okBtn:       'Ok',
  cancelBtn:   'Abbrechen',
  timeView:    'Zeitansicht anzeigen',
  backToDate:  'Zurück zur Kalenderansicht'
}

/**
 * @type {i18nType} English translation
 */
export const en = {
  days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  daysMin:     ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  meridiem:    ['am', 'pm'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  todayBtn:    'Today',
  clearBtn:    'Clear',
  okBtn:       'Ok',
  cancelBtn:   'Cancel',
  timeView:    'Show time view',
  backToDate:  'Back to calendar view'
}


/**
 * @type {i18nType} Spanish translation by markoan
 */

export const es = {
  days:        ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  daysShort:   ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  daysMin:     ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
  months:      ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  meridiem:    ['am', 'pm'],
  suffix:      ['o', '', '', ''],
  todayBtn:    'Hoy',
  clearBtn:    'Borrar',
  okBtn:       'Aceptar',
  cancelBtn:   'Cancelar',
  timeView:    'Mostrar hora',
  backToDate:  'Regresar al calendario'
}

/**
 * @type {i18nType} Persian (Farsi) translation by sadegh19b
 */
export const fa = {
  days:        ['یکشنبه', 'دوشنبه', 'سه‌شنبه‌', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه'],
  daysShort:   ['یکش', 'دوش', 'سه‌ش', 'چهار', 'پنج', 'جمع', 'شنب', 'یکش'],
  daysMin:     ['یک', 'دو', 'سه', 'چا', 'پن', 'جم', 'شن', 'یک'],
  months:      ['ژانویه', 'فوریه', 'مارس', 'آپریل', 'می', 'ژوئن', 'جولای', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  monthsShort: ['ژان', 'فور', 'مار', 'آپر', 'می', 'ژو', 'جول', 'آگو', 'سپت', 'اکت', 'نوا', 'دسا'],
  meridiem:    ['ق.ض', 'ب.ض'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  todayBtn:    'امروز',
  clearBtn:    'پاک‌کردن',
  okBtn:       'تایید',
  cancelBtn:   'لغو',
  timeView:    'نمایش بخش زمان',
  backToDate:  'بازگشت به بخش تقویم'
}

/**
 * @type {i18nType} French translation by Tuditi
 */
export const fr = {
  days:        ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
  daysShort:   ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  daysMin:     ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
  months:      ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthsShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
  meridiem:    ['AM', 'PM'],
  suffix:      ['er', 'ème', 'ème', 'ème'],
  todayBtn:    'Aujourd\'hui',
  clearBtn:    'Effacer',
  okBtn:       'OK',
  cancelBtn:   'Annuler',
  timeView:    'Afficher l\'heure',
  backToDate:  'Retour au calendrier'
}

/**
 * @type {i18nType} Croatian translation by AntonioStipic
 */
export const hr = {
  days:        ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'],
  daysShort:   ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'],
  daysMin:     ['Ne', 'Po', 'Ut', 'Sr', 'Čt', 'Pt', 'Su', 'Ne'],
  months:      ['Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj', 'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'],
  monthsShort: ['Sij', 'Vel', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'],
  meridiem:    ['am', 'pm'],
  suffix:      ['', '', '', ''],
  todayBtn:    'Danas',
  clearBtn:    'Očisti',
  okBtn:       'OK',
  cancelBtn:   'Prekid',
  timeView:    'Prikaži vrijeme',
  backToDate:  'Nazad na kalendar'
}

/**
 * @type {i18nType} Hungarian translation by Tuditi
 */
export const hu = {
  days:        ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'],
  daysShort:   ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'],
  daysMin:     ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'],
  months:      ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szept', 'Okt', 'Nov', 'Dec'],
  meridiem:    ['de', 'du'],
  suffix:      ['.', '.', '.', '.'],
  todayBtn:    'Ma',
  clearBtn:    'Törlés',
  okBtn:       'OK',
  cancelBtn:   'Áthúz',
  timeView:    'Óra nézet',
  backToDate:  'Vissza a naptárhoz'
};

/**
 * @type {i18nType} Indonesian translation
 */
export const id = {
  days:        ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  daysShort:   ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  daysMin:     ['Mn', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mn'],
  months:      ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  meridiem:    ['am', 'pm'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  todayBtn:    'Hari Ini',
  clearBtn:    'Hapus',
  okBtn:       'Mengkonfirmasi',
  cancelBtn:   'Batal',
  timeView:    'Tampilkan tampilan waktu',
  backToDate:  'Kembali ke tampilan kalender'
}

/**
 * @type {i18nType} Japanese translation by aska
 */
export const jp = {
  days:        ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
  daysShort:   ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'],
  daysMin:     ['日', '月', '火', '水', '木', '金', '土', '日'],
  months:      ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  meridiem:    ['am', 'pm'],
  suffix:      ['', '', '', ''],
  todayBtn:    '今日',
  clearBtn:    'クリア',
  okBtn:       '確認する',
  cancelBtn:   'キャンセル',
  timeView:    'タイムを表示',
  backToDate:  'カレンダーに戻る'
}

/**
 * @type {i18nType} Dutch Translation by Tuditi
 */
export const nl = {
  days:        ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'],
  daysShort:   ['Zon', 'Maa', 'Din', 'Woe', 'Don', 'Vri', 'Zat', 'Zon'],
  daysMin:     ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
  months:      ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  meridiem:    ['AM', 'PM'],
  suffix:      ['e', 'e', 'e', 'e'],
  todayBtn:    'Vandaag',
  clearBtn:    'Wissen',
  okBtn:       'OK',
  cancelBtn:   'Annuleren',
  timeView:    'Uurweergave',
  backToDate:  'Terug naar de kalender'
};

/**
 * @type {i18nType} Slovak Translation
 */
export const sk = {
  days:        ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota', 'Nedeľa'],
  daysShort:   ['Ned', 'Pon', 'Uto', 'Str', 'Štv', 'Pia', 'Sob', 'Ned'],
  daysMin:     ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'],
  months:      ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  meridiem:    ['am', 'pm'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  todayBtn:    'Dnes',
  clearBtn:    'Zmazať',
  okBtn:       'Ok',
  cancelBtn:   'Zrušiť',
  timeView:    'Zobraziť hodiny',
  backToDate:  'Späť na kalendár'
}

/**
 * @type {i18nType} Korean translation
 */
export const ko = {
  days:        ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'],
  daysShort:   ['일', '월', '화', '수', '목', '금', '토', '일'],
  daysMin:     ['일', '월', '화', '수', '목', '금', '토', '일'],
  months:      ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  meridiem:    ['오전', '오후'],
  suffix:      ['', '', '', ''],
  todayBtn:    '오늘',
  clearBtn:    '지우기',
  okBtn:       '확인하다',
  cancelBtn:   '취소',
  timeView:    '시계보기',
  backToDate:  '달력보기'
}

/**
 * @type {i18nType} Brazilian portuguese translation by IgorDalepiane
 */
export const pt_BR = {
  days: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'],
  daysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  daysMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá', 'Do'],
  months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  meridiem: ['am', 'pm'],
  suffix: ['º', 'º', 'º', 'º'],
  todayBtn: 'Hoje',
  clearBtn: 'Limpar',
  okBtn:     'OK',
  cancelBtn: 'Cancelar',
  timeView: 'Mostrar hora',
  backToDate: 'Voltar para o calendário'
}

/**
 * @type {i18nType} italian translation by MarkNerdi
 */
export const it = {
  days:        ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
  daysShort:   ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
  daysMin:     ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
  months:      ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  monthsShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
  meridiem:    ['am', 'pm'],
  suffix:      ['º', 'º', 'º', 'º'],
  todayBtn:    'Oggi',
  clearBtn:    'Cancella',
  okBtn:       'Ok',
  cancelBtn:   'Annulla',
  timeView:    'Mostra orario',
  backToDate:  'Torna alla vista calendario'
}

/**
 * @type {i18nType} Turkish translation by semih-ky
 */
export const tr = {
  days:        ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
  daysShort:   ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  daysMin:     ['Pa', 'Pz', 'Sa', 'Ça', 'Pe', 'Cu', 'Cm', 'Pa'],
  months:      ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  meridiem:    ['öö', 'ös'],
  suffix:      ['.', '.', '.', '.'],
  todayBtn:    'Bugün',
  clearBtn:    'Temizle',
  okBtn:       'Ok',
  cancelBtn:   'İptal',
  timeView:    'Zaman görünümünü göster',
  backToDate:  'Takvim görünümüne geri dön'
}

/**
 * @type {i18nType} Swedish translation by brantsrasmus
 */
export const sv = {
  days:        ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'],
  daysShort:   ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
  daysMin:     ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö', 'Sö'],
  months:      ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  meridiem:    ['am', 'pm'],
  suffix:      ['.', '.', '.', '.'],
  todayBtn:    'Idag',
  clearBtn:    'Rensa',
  okBtn:       'Ok',
  cancelBtn:   'Avbryt',
  timeView:    'Visa tid',
  backToDate:  'Tillbaka till kalender'
}

/**
 * @type {i18nType} Danish translation by brantsrasmus
 */
export const da = {
  days:        ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'],
  daysShort:   ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'],
  daysMin:     ['Sø', 'Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'],
  months:      ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  meridiem:    ['am', 'pm'],
  suffix:      ['.', '.', '.', '.'],
  todayBtn:    'I dag',
  clearBtn:    'Slet',
  okBtn:       'Ok',
  cancelBtn:   'Annuller',
  timeView:    'Vis tid',
  backToDate:  'Tilbage til kalenderen'
}

/**
 * @type {i18nType} Thai translation by kodaicoder
 */
export const th = {
  days:        ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
  daysShort:   ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'],
  daysMin:     ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'],
  months:      ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  monthsShort: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  meridiem:    ['am', 'pm'],
  suffix:      ['', '', '', ''],
  todayBtn:    'วันนี้',
  clearBtn:    'ล้างข้อมูล',
  okBtn:       'ยืนยัน',
  cancelBtn:   'ปิด',
  timeView:    'แสดงหน้าเลือกเวลา',
  backToDate:  'กลับไปหน้าปฏิทิน'
}

/**
 * @type {i18nType} Chinese Simplified translation by shiroko <hhx.xxm@gmail.com>
 */
export const zh_CN = {
  days:        ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
  daysShort:   ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  daysMin:     ['日', '一', '二', '三', '四', '五', '六', '日'],
  months:      ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  meridiem:    ['上午', '下午'],
  suffix:      ['', '', '', ''],
  todayBtn:    '今天',
  clearBtn:    '清空',
  timeView:    '显示时间选择',
  backToDate:  '回退到日历选项卡'
}

// always keep it sorted alphabetically
export default {
  ar_DZ, ar_MR, ar_YE, cz, da, de, en, es, fr, hr, hu, id, it, jp, ko, nl, pt_BR, sk, sv, th, tr, zh_CN
}