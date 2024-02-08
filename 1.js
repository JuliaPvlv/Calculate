window.onload = (event) => {
    var b = document.getElementById('cfh');
    console.log(b); 
    console.log('Готов!'); 
    if (b && typeof (b) != 'undefined') {

        // Полный путь к скрипту
        var dir = "https://github.com/JuliaPvlv/Calculate/blob/main";

        var block = $('.cfh');
        var line = block.find('.cfh_line');

        var ftype = block.find('.cfh_type');
        var fdin = block.find('.cfh_din');
        var fdiam = block.find('.cfh_diam');
        var flength = block.find('.cfh_length');
        var frate = block.find('.cfh_rate');
        var fweight = block.find('.cfh_weight');
        var ftotalcount = block.find('.cfh_totalcount');
        var ftotal = block.find('.cfh_total');

        var mailer = $('.cfh_mailer');
        var form = mailer.find('form');
        var success = $('.cfh_success');

        var json;

        var line_clone = line.clone();
        line_clone.find('.cfh_label').remove();

        load_type(ftype);

        // События
        block.on('change', '.cfh_type', change_type);
        block.on('change', '.cfh_din', change_din);
        block.on('change', '.cfh_diam', change_diam);
        block.on('change', '.cfh_length', change_length);
        block.on('change keydown keyup input', '.cfh_rate, .cfh_weight', calculate);
        block.on('input', '.cfh_rate', change_rate);
        block.on('input', '.cfh_weight', change_weight);
        $('.cfh_add').on('click', add_line); // Добавление строки
        $('.cfh_uexcel').on('click', menu_excel); // Ссылка "Сохранить в Excel"
        $('.cfh_uprint').on('click', menu_print); // Ссылка "Печать"

        form.on('submit', function (e) {
            e.preventDefault();
            mailerf();
            return false;
        });
    };


    // ФУНКЦИИ
    // =====================================

    function decimal_adjust(t, v, e) { if (typeof e === 'undefined' || +e === 0) { return Math[t](v) } v = +v; e = +e; if (isNaN(v) || !(typeof e === 'number' && e % 1 === 0)) { return NaN } v = v.toString().split('e'); v = Math[t](+(v[0] + 'e' + (v[1] ? (+v[1] - e) : -e))); v = v.toString().split('e'); return +(v[0] + 'e' + (v[1] ? (+v[1] + e) : e)) } if (!Math.round10) { Math.round10 = function (v, e) { return decimal_adjust('round', v, e) } }
    function print_window(h) { var w = window.open('', 'PRINT', 'height=600,width=600'); w.document.write('<html><head><title>' + document.title + '</title>'); w.document.write('</head><body>'); w.document.write(h); w.document.write('</body></html>'); w.document.close(); w.focus(); w.print(); w.close() }

    // Заполнение "Тип метизов"
    function load_type(type) {
        $.getJSON(dir + '/data.json', function (data) {
            json = data;
            type.append('<option disabled selected>----</option>');
            $.each(json, function () {
                if ($(this)[0].type != 'Круг отрезной') {
                    type.append('<option value="' + $(this)[0].type + '">' + $(this)[0].type + '</option>');
                }
            });

            $('.cfh_type').each(function () {
                $(this).prepend($(this).find('option[value="Проволока"]'));
                $(this).prepend($(this).find('option[value="Винт"]'));
                $(this).prepend($(this).find('option[value="Шайба"]'));
                $(this).prepend($(this).find('option[value="Гайка"]'));
                $(this).prepend($(this).find('option[value="Гвоздь"]'));
                $(this).prepend($(this).find('option[value="Болт"]'));
                $(this).prepend($(this).find('option[value="Саморез"]'));
                $(this).prepend($(this).find('option[disabled]'));
            });

            calculate();
        });
    }

    // Выбор "Тип метизов"
    function change_type() {
        var line = $(this).closest('.cfh_line');

        var type = line.find('.cfh_type');
        var din = line.find('.cfh_din');

        var option = '', count = 0;

        $.each(json, function (i, e1) {
            if (e1.type && e1.type == type.val()) {
                $.each(e1.din, function (i, e2) {
                    option += '<option value="' + e2.value + '">' + e2.value + '</option>';
                });
                count++;
            }
        });

        count > 0 ? din.html(option).prop('disabled', false) : din.html('').prop('disabled', true);

        line.find('.cfh_din').trigger('change');

        calculate();
    }

    // Выбор "Стандарт"
    function change_din() {
        var line = $(this).closest('.cfh_line');

        var type = line.find('.cfh_type');
        var din = line.find('.cfh_din');
        var diam = line.find('.cfh_diam');

        var option = '', count = 0;

        $.each(json, function (i, e1) {
            if (e1.type && e1.type == type.val()) {
                $.each(e1.din, function (i, e2) {
                    if (e2.value && e2.value == din.val()) {
                        $.each(e2.diam, function (i, e3) {
                            option += '<option value="' + e3.value + '">' + e3.value + '</option>';
                        });
                        count++;
                    }
                });
            }
        });

        count > 0 ? diam.html(option).prop('disabled', false) : diam.html('').prop('disabled', true);

        line.find('.cfh_diam').trigger('change');

        calculate();
    }

    // Выбор "Диаметр"
    function change_diam() {
        var line = $(this).closest('.cfh_line');

        var type = line.find('.cfh_type');
        var din = line.find('.cfh_din');
        var diam = line.find('.cfh_diam');
        var length = line.find('.cfh_length');
        var rate = line.find('.cfh_rate');
        var weight = line.find('.cfh_weight');

        var option_length = '', count_length = 0;

        $.each(json, function (i, e1) {
            if (e1.type && e1.type == type.val()) {
                $.each(e1.din, function (i, e2) {
                    if (e2.value && e2.value == din.val()) {
                        $.each(e2.diam, function (i, e3) {
                            if (e3.value && e3.value == diam.val()) {
                                if (e3.length) {
                                    $.each(e3.length, function (i, e4) {
                                        option_length += '<option value="' + e4.value + '">' + e4.value + '</option>';
                                    });
                                    count_length++;
                                } else {
                                    var w = e3.weight * Number(rate.val());
                                    w = Math.round10(w, -3);

                                    weight.attr('data-value', e3.weight);
                                    weight.val(w);
                                }
                            }
                        });
                    }
                });
            }
        });

        count_length > 0 ? length.html(option_length).prop('disabled', false) : length.html('').prop('disabled', true);

        line.find('.cfh_length').trigger('change');

        calculate();
    }

    // Выбор "Длина"
    function change_length() {
        var line = $(this).closest('.cfh_line');

        var type = line.find('.cfh_type');
        var din = line.find('.cfh_din');
        var diam = line.find('.cfh_diam');
        var length = line.find('.cfh_length');
        var rate = line.find('.cfh_rate');
        var weight = line.find('.cfh_weight');

        var option_length = '';

        $.each(json, function (i, e1) {
            if (e1.type && e1.type == type.val()) {
                $.each(e1.din, function (i, e2) {
                    if (e2.value && e2.value == din.val()) {
                        $.each(e2.diam, function (i, e3) {
                            if (e3.value && e3.value == diam.val()) {
                                if (e3.length) {
                                    $.each(e3.length, function (i, e4) {
                                        if (e4.value && e4.value == length.val()) {
                                            var w = e4.weight * Number(rate.val());
                                            w = Math.round10(w, -3);

                                            weight.attr('data-value', e4.weight);
                                            weight.val(w);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });

        calculate();
    }

    // Выбор "Количество"
    function change_rate() {
        var line = $(this).closest('.cfh_line');

        var rate = line.find('.cfh_rate');
        var weight = line.find('.cfh_weight');

        weight.val(Math.round10(Number(weight.attr('data-value')) * Number(rate.val()), -3));

        calculate();
    }

    // Выбор "Вес"
    function change_weight() {
        var line = $(this).closest('.cfh_line');

        var rate = line.find('.cfh_rate');
        var weight = line.find('.cfh_weight');

        rate.val(Math.round10(Number(weight.val()) / Number(weight.attr('data-value')), 0));

        calculate();
    }

    // Добавление строки
    function add_line() {
        var line = line_clone.clone();
        $('.cfh_linetotal').before(line);

        line.find('.cfh_add').on('click', add_line);
        line.find('.cfh_del').on('click', del_line);

        load_type(line.find('.cfh_type'));
    }

    // Удаление строки
    function del_line() {
        $(this).closest('.cfh_line').remove();

        calculate();
    }

    // Расчет
    function calculate() {
        var totalcount = 0;
        block.find('.cfh_rate').each(function () {
            totalcount += Number($(this).val());
        });

        var total = 0;
        block.find('.cfh_weight').each(function () {
            total += Number($(this).val());
        });

        totalcount = Math.round10(totalcount, 0);
        total = Math.round10(total, -3);

        if (totalcount == 0) totalcount = '';
        if (total == 0) total = '';

        ftotalcount.val(totalcount);
        ftotal.val(total);
    }

    // Ссылка "Сохранить в Excel"
    function menu_excel() {
        var type0 = [];
        var type = [];
        var din = [];
        var diam = [];
        var length = [];
        var rate = [];
        var weight = [];
        var total = [ftotalcount.val(), ftotal.val()];

        block.find('.cfh_type').each(function (i) { type0[i] = $(this).val() });
        block.find('.cfh_type').each(function (i) { type[i] = $(this).val() });
        block.find('.cfh_din').each(function (i) { din[i] = $(this).val() });
        block.find('.cfh_diam').each(function (i) { diam[i] = $(this).val() });
        block.find('.cfh_length').each(function (i) { length[i] = $(this).val() });
        block.find('.cfh_rate').each(function (i) { rate[i] = $(this).val() });
        block.find('.cfh_weight').each(function (i) { weight[i] = $(this).val() });

        $.ajax({
            data: {
                type0: type0,
                type: type,
                din: din,
                diam: diam,
                length: length,
                rate: rate,
                weight: weight,
                total: total,
            },
            url: dir + '/php/excel.php',
            type: 'POST',
            success: function (data) {
                console.log(data);
                window.open(dir + '/php/files/' + data + '/table.xlsx');
            }
        });
    }

    // Ссылка "Печать"
    function menu_print() {
        var type = [];
        var din = [];
        var diam = [];
        var length = [];
        var rate = [];
        var weight = [];
        var total = [ftotalcount.val(), ftotal.val()];

        block.find('.cfh_type').each(function (i) { type[i] = $(this).val() });
        block.find('.cfh_din').each(function (i) { din[i] = $(this).val() });
        block.find('.cfh_diam').each(function (i) { diam[i] = $(this).val() });
        block.find('.cfh_length').each(function (i) { length[i] = $(this).val() });
        block.find('.cfh_rate').each(function (i) { rate[i] = $(this).val() });
        block.find('.cfh_weight').each(function (i) { weight[i] = $(this).val() });

        var count = type.length;
        var table = '<table border="1" cellspacing="0"><thead><th>Тип метизов</th><th>Стандарт</th><th>Диаметр</th><th>Длина</th><th>Кол-во, шт.</th><th>Вес, кг.</th></tr></thead><tbody>';
        for (i = 0; i < count; i++) {
            table += '<tr><td>' + type[i] + '</td><td>' + din[i] + '</td><td>' + diam[i] + '</td><td>' + length[i] + '</td><td>' + rate[i] + '</td><td>' + weight[i] + '</td></tr>';
        }
        table += '<tr><th></th><th></th><th></th><th>Итого:</th><th>' + total[0] + '</th><th>' + total[1] + '</th></tr></tbody></table>';

        print_window(table);
    }
    //});

    // Ссылка "Добавить в избранное"
    function getBrowserInfo() {
        var t, v = undefined;

        if (window.chrome) t = 'Chrome';
        else if (window.opera) t = 'Opera';
        else if (document.all) {
            t = 'IE';
            var nv = navigator.appVersion;
            var s = nv.indexOf('MSIE') + 5;
            v = nv.substring(s, s + 1);
        } else if (navigator.appName) t = 'Netscape';

        return { type: t, version: v };
    }
    function cfh_uadd(a) {
        var url = window.document.location;
        var title = window.document.title;
        var b = getBrowserInfo();

        if (b.type == 'IE' && 8 >= b.version && b.version >= 4) window.external.AddFavorite(url, title);
        else if (b.type == 'Opera') {
            a.href = url;
            a.rel = "sidebar";
            a.title = url + ',' + title;
            return true;
        }
        else if (b.type == "Netscape") window.sidebar.addPanel(title, url, "");
        else alert("Нажмите CTRL-D, чтобы добавить страницу в закладки.");
        return false;
    }
};
