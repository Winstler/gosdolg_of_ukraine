(async function(){
        var user_date = new Date();//создаём обьект даты пользователя текущего времени его пк

        let year = String(user_date.getFullYear()); //строки ниже преобразуют формат даты в нужный для даты в api

        let month = String(user_date.getMonth());
        if(month<10){
            month = '0'+month;
        }

        let date = String(user_date.getDate());
        if(date<10){
            date = '0'+date;
        }
        user_date = year + month + date;


        const URL_currencies = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${user_date}&json`;//присылаю json c долгами
        let curencies = await fetch(URL_currencies);
        curencies = await curencies.json();
        let curencies_cc = curencies.map(item => item.cc);//преобразую в список кодов для удобства в последующим выполнении кода

        let URL_debt = `https://bank.gov.ua/NBUStatService/v1/statdirectory/ovdp?json`;//присылаю json c валютами
        let debt = await fetch(URL_debt);
        debt = await debt.json();



        let amount = 0;//общий долг
        let repaydate;//временное хранение даты долга
        let valcode;//временно сохраняю код нужной валюты для перевода
        let num_cur; //номер в массиве по нужной валюте

        for(i = 0;debt.length-1>=i;i++){//цикл, который просчитывает каждый елемент в массиве

            debt[i].repaydate = debt[i].repaydate.split('.');//в этих двух строках переводится дата из строки в формат даты js
            repaydate = new Date(debt[i].repaydate[2],debt[i].repaydate[1],debt[i].repaydate[0], 23, 59,59,999)

            if(debt[i].repaydate>=date){//проверка, если дата оплаты больше даты пользователя, то долг засчитывается 

                if(debt[i].valcode == 'UAH'){//если долг в грн, то сразу плюсуется

                    amount += debt[i].attraction;

                }
                else{//если нет, то переводится с нужной валюты в грн

                    valcode = debt[i].valcode;
                    num_cur = curencies_cc.indexOf(valcode);
                    amount += debt[i].attraction * curencies[num_cur].rate;

                }

            }
            else{
                continue;
            }

        }

        let dollar_amount = amount/curencies[26].rate;//подсчитка в долларах

        let persons = 41400000; //в случае чего, изменять кол-во людей тут

        let uah_person = amount/persons;//рассчёт долга одного человека
        let usd_person = dollar_amount/persons;

        amount = Math.trunc(amount);              //4 ПЕРЕМЕННЫЕ ДЛЯ ВЫВОДА - ОБЩИЙ ДОЛГ В ГРИВНАХ
        dollar_amount = Math.trunc(dollar_amount);//4 ПЕРЕМЕННЫЕ ДЛЯ ВЫВОДА - ОБЩИЙ ДОЛГ В ДОЛЛАРАХ
        uah_person = uah_person.toFixed(2);       //4 ПЕРЕМЕННЫЕ ДЛЯ ВЫВОДА - ДОЛГ НА ЧЕЛОВЕКА В ГРИВНАХ
        usd_person = usd_person.toFixed(2);       //4 ПЕРЕМЕННЫЕ ДЛЯ ВЫВОДА - ДОЛГ НА ЧЕЛОВЕКА В ДОЛЛАРАХ


    })();
