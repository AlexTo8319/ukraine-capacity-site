// Question bank with role-based filtering
const questions = {
    sphere1: {
        id: 'policy',
        name: 'Розуміння та застосування політики',
        icon: '📜',
        questions: [
            {
                id: 'q3',
                text: 'Оцініть ваше загальне розуміння чинної нормативно-правової бази, що регулює просторове планування в Україні.',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Дуже низьке розуміння',
                    5: 'Дуже високе розуміння'
                }
            },
            {
                id: 'q4',
                text: 'Наскільки послідовно застосовуються закони та підзаконні акти з просторового планування у процесах прийняття рішень у громаді?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Ніколи послідовно',
                    5: 'Завжди послідовно'
                }
            },
            {
                id: 'q5',
                text: 'В якій мірі чинне законодавство у сфері просторового планування відповідає конкретним потребам та контексту вашої громади?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                score: false,
                scale: {
                    1: 'Зовсім не відповідає',
                    5: 'Повністю відповідає'
                }
            }
        ]
    },
    sphere2: {
        id: 'strategic',
        name: 'Стратегічне бачення та планування',
        icon: '🎯',
        questions: [
            {
                id: 'q6',
                text: 'Які з цих документів затверджені у вашій громаді?',
                type: 'multiple',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                options: [
                    { value: 'recovery', text: 'Програма Комплексного Відновлення' },
                    { value: 'integrated', text: 'Концепція Інтегрованого Розвитку' },
                    { value: 'spatial', text: 'Комплексний План Просторового Розвитку' },
                    { value: 'none', text: 'Жодного з перелічених' },
                    { value: 'unknown', text: 'Невідомо' }
                ]
            },
            {
                id: 'q7',
                text: 'Оцініть зрозумілість та корисність стратегічних документів просторового розвитку вашої громади (якщо вони є).',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Дуже незрозумілі / Некорисні',
                    5: 'Дуже зрозумілі / Дуже корисні'
                },
                conditional: {
                    dependsOn: 'q6',
                    showIf: ['recovery', 'integrated', 'spatial']
                }
            },
            {
                id: 'q8',
                text: 'Наскільки добре поточні просторові плани враховують довгострокові цілі та виклики, визначені для громади?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Зовсім не враховують',
                    5: 'Дуже добре враховують'
                }
            },
            {
                id: 'q9',
                text: 'Наскільки стратегічне планування громади адекватно враховує потреби та пріоритети післявоєнного відновлення?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Зовсім не адекватно',
                    5: 'Дуже адекватно'
                }
            },
            {
                id: 'q10',
                text: 'Наскільки активно громада використовує свої стратегічні просторові документи для прийняття щоденних рішень та реалізації проектів?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Ніколи не використовує',
                    5: 'Завжди використовує'
                }
            },
            {
                id: 'q11',
                text: 'Чи вважаєте ви, що стратегічне бачення громади відображає різноманітні прагнення та потреби її мешканців?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Повністю не згоден',
                    5: 'Повністю згоден'
                }
            }
        ]
    },
    sphere3: {
        id: 'data',
        name: 'Управління даними та інформацією',
        icon: '💾',
        questions: [
            {
                id: 'q12',
                text: 'Оцініть доступність актуальної та точної земельно-кадастрової інформації для цілей просторового планування у вашій громаді.',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Дуже погана / Недоступна',
                    5: 'Дуже добра / Широко доступна'
                }
            },
            {
                id: 'q13',
                text: 'Наскільки доступними є ключові дані просторового планування (наприклад, карти, інформація про зонування) для громадськості та зовнішніх зацікавлених сторін?',
                type: 'likert',
                applicableTo: ['technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Зовсім недоступні',
                    5: 'Дуже легко доступні'
                }
            },
            {
                id: 'q14',
                text: 'Наскільки ефективно використовуються технології ГІС (географічних інформаційних систем) у процесах просторового планування в громаді?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Не використовуються ефективно',
                    5: 'Дуже ефективно використовуються'
                }
            },
            {
                id: 'q15',
                text: 'Оцініть якість та повноту топографічних карт громади та базових картографічних даних.',
                type: 'likert',
                applicableTo: ['technical', 'department'],
                scale: {
                    1: 'Дуже погана / Неповна',
                    5: 'Дуже добра / Повна'
                }
            },
            {
                id: 'q16',
                text: 'Якщо доступ до просторових даних обмежений, які основні причини?',
                type: 'multiple',
                multiple: true,
                applicableTo: ['leadership', 'technical'],
                options: [
                    { value: 'outdated', text: 'Дані застарілі або неповні' },
                    { value: 'no_staff', text: 'Нестача персоналу для управління даними' },
                    { value: 'fragmented', text: 'Роз\'єднані та несумісні реєстри' },
                    { value: 'not_digital', text: 'Відсутність оцифрованих даних / старі формати' },
                    { value: 'martial_law', text: 'Воєнний стан' },
                    { value: 'other', text: 'Інші причини:' }
                ]
            },
            {
                id: 'q17',
                text: 'Чи є реєстри нерухомості та кадастри фрагментованими або складними для інтеграції для комплексного планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical'],
                score: false,
                scale: {
                    1: 'Повністю не згоден - немає фрагментації',
                    5: 'Повністю згоден - значна фрагментація'
                }
            }
        ]
    },
    sphere4: {
        id: 'financial',
        name: 'Фінансові ресурси',
        icon: '💰',
        questions: [
            {
                id: 'q18',
                text: 'Наскільки достатніми є власні фінансові ресурси громади (податкові надходження, місцевий бюджет) для фінансування необхідних заходів та проектів просторового планування?',
                type: 'likert',
                applicableTo: ['leadership', 'department', 'technical'],
                scale: {
                    1: 'Дуже недостатні',
                    5: 'Дуже достатні'
                }
            },
            {
                id: 'q19',
                text: 'Наскільки успішно громада залучає зовнішнє фінансування (державні субсидії, гранти, приватні інвестиції) для реалізації ініціатив просторового розвитку?',
                type: 'likert',
                applicableTo: ['leadership', 'department', 'technical', 'cso'],
                scale: {
                    1: 'Зовсім не успішно',
                    5: 'Дуже успішно'
                }
            },
            {
                id: 'q20',
                text: 'В якій мірі громада ефективно використовує дані про земельний податок для інформування та підтримки рішень щодо просторового планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Зовсім не ефективно',
                    5: 'Дуже ефективно'
                }
            },
            {
                id: 'q21',
                text: 'Наскільки ефективно громада використовує такі механізми, як оцінка вартості землі або подібні фінансові інструменти, пов\'язані з розвитком, для фінансування відповідної інфраструктури?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Зовсім не ефективно',
                    5: 'Дуже ефективно'
                }
            },
            {
                id: 'q22',
                text: 'Наскільки рішення з просторового планування враховують довгострокову економічну доцільність та витрати на утримання нових об\'єктів, будівель та інфраструктури?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Зовсім не враховують',
                    5: 'Дуже добре враховують'
                }
            },
            {
                id: 'q23',
                text: 'Чи погоджуєтесь ви з твердженням: "Через обмежені фінансові ресурси перевага часто надається швидким, менш стійким рішенням замість економічно обґрунтованого довгострокового планування"?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Повністю не згоден',
                    5: 'Повністю згоден'
                },
                reverse: true
            }
        ]
    },
    sphere5: {
        id: 'stakeholder',
        name: 'Залучення зацікавлених сторін та участь громадськості',
        icon: '👥',
        questions: [
            {
                id: 'q24',
                text: 'Як часто громада проводить громадські консультації або залучає зацікавлених сторін до проектів з просторового планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Ніколи',
                    5: 'Дуже часто'
                }
            },
            {
                id: 'q25',
                text: 'Оцініть ефективність методів, які використовує громада для залучення різних груп населення (наприклад, молоді, людей похилого віку, ВПО, людей з інвалідністю) до обговорення питань планування.',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Дуже неефективні',
                    5: 'Дуже ефективні'
                }
            },
            {
                id: 'q26',
                text: 'Якою мірою думки громадськості та зацікавлених сторін дійсно враховуються та відображаються в остаточних рішеннях щодо планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Зовсім не враховуються',
                    5: 'Повною мірою враховуються'
                }
            },
            {
                id: 'q27',
                text: 'У якій мірі, на вашу думку, впливові групи стейкхолдерів, що просувають власні інтереси, заважають відкритій та інклюзивній участі громадськості у процесі планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Зовсім не заважають',
                    5: 'Дуже заважають'
                },
                reverse: true
            },
            {
                id: 'q28',
                text: 'Наскільки доступними та зрозумілими є матеріали та інформація, що надаються громадськості для участі у просторовому плануванні?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Дуже недоступні / Складні для розуміння',
                    5: 'Дуже доступні / Легкі для розуміння'
                }
            }
        ]
    },
    sphere6: {
        id: 'cooperation',
        name: 'Координація та співпраця',
        icon: '🤝',
        questions: [
            {
                id: 'q29',
                text: 'Наскільки ефективно різні підрозділи в громаді координуються між собою щодо роботи над проектами з просторового планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Дуже неефективно',
                    5: 'Дуже ефективно'
                }
            },
            {
                id: 'q30',
                text: 'Наскільки ефективною є співпраця між громадою та обласними/центральними органами влади з питань просторового планування та розвитку?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'cso'],
                scale: {
                    1: 'Дуже неефективна',
                    5: 'Дуже ефективна'
                }
            },
            {
                id: 'q31',
                text: 'Наскільки активно приватний сектор залучений до обговорення та планування проектів просторового розвитку та відновлення в громаді?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'cso'],
                scale: {
                    1: 'Зовсім не залучений',
                    5: 'Дуже активно залучений'
                },
                score: false
            },
            {
                id: 'q32',
                text: 'Чи вважаєте ви, що брак горизонтальної комунікації та можливостей співпраці перешкоджає ефективному просторовому плануванню в Україні?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                score: false,
                scale: {
                    1: 'Повністю не згоден',
                    5: 'Повністю згоден'
                },
                reverse: true
            },
            {
                id: 'q33',
                text: 'Оцініть ефективність співпраці з міжнародними організаціями та зовнішніми експертами щодо ініціатив просторового планування в громаді.',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'cso'],
                scale: {
                    1: 'Відсутня співпраця',
                    5: 'Дуже успішна співпраця'
                }
            }
        ]
    },
    sphere7: {
        id: 'technical',
        name: 'Технічна експертиза та професійні навички',
        icon: '🔧',
        questions: [
            {
                id: 'q34',
                text: 'Оцініть наявність кваліфікованих фахівців (містопланувальників, архітекторів, землевпорядників, ГІС-спеціалістів тощо) в громаді для вирішення завдань просторового планування.',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Дуже низька наявність / Значний дефіцит',
                    5: 'Дуже висока наявність / Достатня кількість'
                }
            },
            {
                id: 'q35',
                text: 'Якщо існує дефіцит кваліфікованих кадрів, які основні причини цього?',
                type: 'multiple',
                applicableTo: ['leadership', 'department', 'technical'],
                options: [
                    { value: 'low_salary', text: 'Низька заробітна плата/відсутність конкурентоспроможної компенсації' },
                    { value: 'no_candidates', text: 'Брак кваліфікованих кандидатів з необхідними навичками' },
                    { value: 'no_development', text: 'Обмежені можливості для професійного розвитку/навчання' },
                    { value: 'war_displacement', text: 'Переміщення персоналу (наприклад, через війну)' },
                    { value: 'bureaucracy', text: 'Складна бюрократія перешкоджає найму' },
                    { value: 'other', text: 'Інші причини:' }
                ]
            },
            {
                id: 'q36',
                text: 'Наскільки добре персонал громади забезпечений необхідними цифровими інструментами (наприклад, програмним забезпеченням ГІС, доступом до кадастру) для просторового планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical'],
                scale: {
                    1: 'Дуже погано забезпечений',
                    5: 'Дуже добре забезпечений'
                }
            },
            {
                id: 'q37',
                text: 'Наскільки достатніми є можливості та ресурси для навчання персоналу громади сучасним методам, інструментам і підходам планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical'],
                scale: {
                    1: 'Дуже недостатні',
                    5: 'Дуже достатні'
                }
            },
            {
                id: 'q38',
                text: 'Наскільки ефективно громада залучає зовнішню експертизу (консультантів, експертів з НУО, науковців), коли внутрішній потенціал для просторового планування обмежений?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'cso'],
                scale: {
                    1: 'Не використовується ефективно',
                    5: 'Дуже ефективно використовується'
                }
            },
            {
                id: 'q39',
                text: 'Чи вважаєте ви, що поточна система професійної освіти в Україні адекватно готує спеціалістів для складностей просторового планування на рівні громади?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'cso'],
                score: false,
                scale: {
                    1: 'Повністю не згоден',
                    5: 'Повністю згоден'
                }
            },
            {
                id: 'q40',
                text: 'Наскільки обізнана команда планування громади щодо європейських найкращих практик та міжнародних стандартів у міському розвитку та просторовому плануванні?',
                type: 'likert',
                applicableTo: ['leadership', 'technical'],
                scale: {
                    1: 'Дуже низька обізнаність',
                    5: 'Дуже висока обізнаність'
                }
            }
        ]
    },
    sphere8: {
        id: 'political',
        name: 'Політична воля та лідерство',
        icon: '🏛️',
        questions: [
            {
                id: 'q41',
                text: 'Наскільки керівництво громади надає пріоритетне значення сталому розвитку та довгостроковому просторовому плануванню в загальному порядку денному?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Дуже низький пріоритет',
                    5: 'Дуже високий пріоритет'
                }
            },
            {
                id: 'q42',
                text: 'В якій мірі керівництво громади ефективно управляє конфліктними інтересами (наприклад, між забудовниками, громадянами, різними відділами) при прийнятті рішень щодо просторового планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Дуже неефективно',
                    5: 'Дуже ефективно'
                }
            },
            {
                id: 'q43',
                text: 'Чи вважаєте ви, що керівництво громади має політичну волю послідовно дотримуватися затверджених просторових планів, навіть під тиском ухвалити швидкі чи менш сталі рішення?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Повністю не згоден',
                    5: 'Повністю згоден'
                }
            },
            {
                id: 'q44',
                text: 'Чи згодні ви з тим, що децентралізація загалом розширила можливості громад у просторовому плануванні, незважаючи на виклики, пов\'язані з воєнним станом?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                score: false,
                scale: {
                    1: 'Повністю не згоден',
                    5: 'Повністю згоден'
                }
            }
        ]
    },
    sphere9: {
        id: 'adaptation',
        name: 'Адаптивність та стійкість',
        icon: '🔄',
        questions: [
            {
                id: 'q45',
                text: 'Наскільки добре просторове планування громади враховує і задовольняє потреби внутрішньо переміщених осіб (ВПО)?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Зовсім не враховує',
                    5: 'Дуже добре враховує'
                }
            },
            {
                id: 'q46',
                text: 'В якій мірі принципи сталого розвитку (наприклад, енергоефективність, зелена інфраструктура, циркулярна економіка) інтегровані в нові проекти з просторового планування?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Зовсім не інтегровані',
                    5: 'Повністю інтегровані'
                }
            },
            {
                id: 'q47',
                text: 'Наскільки система планування в громаді враховує ризики, пов\'язані зі зміною клімату (наприклад, повені, аномальна спека)?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Зовсім не підготовлена',
                    5: 'Дуже добре підготовлена'
                }
            },
            {
                id: 'q48',
                text: 'Наскільки ефективно у вашій громаді просторові плани інтегрують оцінку збитків і заходи з відновлення зруйнованих чи пошкоджених об\'єктів?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Дуже неефективно',
                    5: 'Дуже ефективно'
                }
            },
            {
                id: 'q49',
                text: 'Чи вважаєте ви, що нинішній підхід до планування є достатньо гнучким, щоб адаптуватися до швидких змін і невизначеностей, спричинених війною?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department', 'cso', 'resident'],
                scale: {
                    1: 'Повністю не згоден',
                    5: 'Повністю згоден'
                }
            },
            {
                id: 'q50',
                text: 'Наскільки зрозумілим є процес визначення пріоритетів та координації проектів післявоєнного відновлення в громаді?',
                type: 'likert',
                applicableTo: ['leadership', 'technical', 'department'],
                scale: {
                    1: 'Дуже незрозумілий',
                    5: 'Дуже зрозумілий'
                }
            }
        ]
    }
};

// Role definitions
const roles = {
    leadership: {
        name: 'Керівництво громади',
        description: 'Представники керівництва громади'
    },
    technical: {
        name: 'Технічний спеціаліст',
        description: 'Технічні спеціалісти з просторового планування'
    },
    department: {
        name: 'Представник іншого відділу громади',
        description: 'Представник відділу, робота якого пов\'язана з просторовим плануванням'
    },
    cso: {
        name: 'Представник ГО/НУО',
        description: 'Представник громадської організації або неурядової організації'
    },
    resident: {
        name: 'Мешканець громади',
        description: 'Звичайний мешканець громади'
    }
};

// Helper function to get questions applicable to a specific role
function getQuestionsForRole(role) {
    const filteredQuestions = {};
    
    Object.keys(questions).forEach(sphereKey => {
        const sphere = questions[sphereKey];
        const applicableQuestions = sphere.questions.filter(q => 
            q.applicableTo.includes(role)
        );
        
        if (applicableQuestions.length > 0) {
            filteredQuestions[sphereKey] = {
                ...sphere,
                questions: applicableQuestions
            };
        }
    });
    
    return filteredQuestions;
}

// Helper function to get all questions for a role (flattened)
function getAllQuestionsForRole(role) {
    const roleQuestions = getQuestionsForRole(role);
    const allQuestions = [];
    
    Object.values(roleQuestions).forEach(sphere => {
        sphere.questions.forEach(question => {
            allQuestions.push({
                ...question,
                sphereId: sphere.id,
                sphereName: sphere.name
            });
        });
    });
    
    return allQuestions;
}

// Export for use in other files
window.questionData = questions;
window.roles = roles;
window.getQuestionsForRole = getQuestionsForRole;
window.getAllQuestionsForRole = getAllQuestionsForRole;