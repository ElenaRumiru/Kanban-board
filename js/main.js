"use strict";
/* <=================================== Находим элементы ===================================> */
const e_mainContainer = document.getElementById('main-container');
const e_cardsContainer = document.getElementById('cards-container');

const e_sidebar = document.getElementById('sidebar');
const e_sidebarButton = document.getElementById('sidebar-button');
const e_sidebarClose = document.getElementById('sidebar-close');

const e_addCardText = document.getElementById('add-card-text');
const e_addCardButton = document.getElementById('add-card-button');

const e_boardsList = document.getElementById('boards-list');
const e_addBoardText = document.getElementById('add-board-text');
const e_addBoardButton = document.getElementById('add-board-button');

const e_autoSaveButton = document.getElementById('auto-save');
const e_saveButton = document.getElementById('save-button');
const e_settingsButton = document.getElementById('settings-button');
const e_deleteButton = document.getElementById('delete-button');

const e_cardContextMenu = document.getElementById('card-context-menu');
const e_cardContextMenuDelete = document.getElementById('card-context-menu-delete');
const e_cardContextMenuClear = document.getElementById('card-context-menu-clear');
const e_cardContextMenuDuplicate = document.getElementById('card-context-menu-duplicate');

const e_alerts = document.getElementById('alerts');

const e_title = document.getElementById('title');

// Авто-сохранение по умолчанию включено
let autoSaveInternalId = setInterval(function (){
    saveData();
}, 5000);

let appData = {
    'boards': [],
    'settings': {
        'userName': "User",
        //[not yet] 'defaultTheme': "blue",
        'dataPersistence': true
    },
    'currentBoard': 0,  // The index of the currently open board.
    'identifier': 0
};

function currentCards() {
    return appData.boards[appData.currentBoard].cards;
}

function currentBoard() {
    return appData.boards[appData.currentBoard];
}

/* <=================================== Расширения ===================================> */
Array.prototype.move = function(from, to) {
    /* Переместить элемент из массива в определенный индекс массива. */

    this.splice(to, 0, this.splice(from, 1)[0]);
};

Array.prototype.insert = function(index, item) {
    /* Вставить элемент в определенный индекс массива. */

    this.splice( index, 0, item );
};

/* <=================================== Функции ===================================> */
function uniqueID() {
    appData.identifier += 1;
    return 'b' + appData.identifier;
}

function getMouseOverCard() {
    // Находим карту, над которой в данный момент находится курсор мыши.
    return document.querySelectorAll('.parent-card:hover')[0];
}

function getMouseOverItem() {
    // Находим задачц, над которой в данный момент находится курсор мыши.
    return document.querySelectorAll('.parent-card > ul > li:hover')[0];
}

function getItemFromElement(element) {
    /* Получить объект Item из элемента list item. */

    for (let _card of currentCards()) {
        for (let _item of _card.items) {
            if (_item.id === element.id) {
                return _item;
            }
        }
    }
}

function getCardFromElement(element) {
    /* Получаем объект Card из элемента card div. */

    return currentCards().find(e => e.id === element.id);
}

function getBoardFromId(id) {
    /* Получаем объект board по его id */

    return appData.boards.find(_b => _b.id === id);
}

function listBoards() {
    /* Перечисляем все доски на боковой панели */

    e_boardsList.innerHTML = '';
    for (let _board of appData.boards) {
        let _boardTitle = document.createElement('li');
        _boardTitle.innerText = _board.name;
        _boardTitle.id = _board.id;
        if (_board.id === currentBoard().id) _boardTitle.classList.add('is-active');
        _boardTitle.addEventListener('click', () => {
            renderBoard(_board);
            listBoards();
        });
        e_boardsList.appendChild(_boardTitle);
    }
}

function renderBoard(board) {
    appData.currentBoard = appData.boards.indexOf(board);
    document.title = 'Board | ' + currentBoard().name;
    e_title.innerText = currentBoard().name;
    //e_title.addEventListener('click'), разрешить редактирование названия доски объявлений
    // To-Do: set theme
    renderAllCards();
}

function renderAllCards() {
    /* Обновляем весь контейнер для карточек. */

    for (let _card of e_cardsContainer.querySelectorAll('.parent-card')) {

        // Удалить все карточки из контейнера.
        _card.remove();
    }

    for (let _card of currentCards()) {
        // Восстановите каждую карточку.
        let _generated = _card.generateElement();
        // Помещаем их в контейнер прямо перед последним дочерним элементом (текстовое поле для новой карточки).
        e_cardsContainer.insertBefore(_generated, e_cardsContainer.childNodes[e_cardsContainer.childNodes.length - 2]);
        // Обновляем карточку для прослушивателей событий и т.д....
        _card.update();
    }
}

function renderCard(cardID) {
    let _card = currentCards().find(e => e.id === cardID);

    if (!_card) {
        // Если карта больше не существует в данных. (т.е. удалена, но все еще отображается в DOM)
        // Удаляем ее из DOM
        let _currentCardElement = document.getElementById(cardID);
        _currentCardElement.parentNode.removeChild(_currentCardElement);
        return;
    }

    // Получаем текущий элемент карты, если он существует.
    let _currentCardElement = document.getElementById(_card.id);
    if (_currentCardElement != null) {
        let _generated = _card.generateElement();
        // Перемещаем карту из контейнера
        _currentCardElement.parentNode.replaceChild(_generated, _currentCardElement);
    } else {
        let _generated = _card.generateElement();
        // Помещаем их в контейнер прямо перед последним дочерним элементом (текстовое поле для новой карточки).
        e_cardsContainer.insertBefore(_generated, e_cardsContainer.childNodes[e_cardsContainer.childNodes.length - 2]);
    }

    // Обновляем карточку для прослушивателей событий и т.д.
    _card.update();
}

function toggleHoverStyle(show) {
    /* Устанавливает, изменяет ли наведение курсора на карточки / предметы их цвета или нет. */

    if (show) {

        // Создаем новый стиль элемента
        let _hoverStyle = document.createElement('style');
        _hoverStyle.id = "dragHover";

        // Карточка и элемент должны стать немного темнее при перемещении.
        _hoverStyle.innerHTML = ".parent-card:hover {background-color: #c7cbd1;}.parent-card > ul > li:hover {background-color: #d1d1d1;}";
        document.body.appendChild(_hoverStyle);
    } else {

        // Избавляемся от стиля элемента.
        // Это эффективно предотвращает потемнение элементов при наведении курсора.
        let _hoverStyle = document.getElementById('dragHover');
        _hoverStyle.parentNode.removeChild(_hoverStyle);
    }
}

function addBoard() {
    /* Добавляем новую доску на основе данных, введенных на боковой панели. */

    let _boardTitle = e_addBoardText.value;
    if (!_boardTitle) return createAlert("Type a name for the board!");  // Мы не создаем доску, если у нее нет названия.
    if (appData.boards.length >= 512) return createAlert("Max limit for boards reached.")  // или если досок уже слишком много
    e_addBoardText.value = '';

    let _newBoard = new Board(_boardTitle, uniqueID(), {'theme': null});
    appData.boards.push(_newBoard);
    listBoards();
}

/* <=================================== Классы ===================================> */
class Item {

    constructor(title, description=null, id, parentCardId) {
        this.title = title;
        this.description = description;  // Описание в будущем
        this.id = id;
        this.isDone = false;
        this.parentCardId = parentCardId;
        this.deadline = deadline;
    }

    getParentCard() {
        return document.getElementById(this.parentCardId);
    }

    check(chk=true) {
        this.isDone = chk;
        if (chk) {

            // Зачеркните текст, если на него нажать.
            document.getElementById(this.id).style.textDecoration = 'line-through';
        } else {

            // Уберите зачеркивание из текста.
            document.getElementById(this.id).style.textDecoration = 'none';
        }
    }

    update() {
        let _element = document.getElementById(this.id);

        _element.getElementsByTagName('p')[0].addEventListener('click', () => {
            if (this.isDone) {
                this.check(false);
            } else {
                this.check(true);
            }
        });

        _element.addEventListener('mousedown', cardDrag_startDragging, false);
        this.check(this.isDone);
    }
}

class Card {

    constructor(name, id, parentBoardId) {
        this.name = name;
        this.items = [];
        this.id = id;
        this.parentBoardId = parentBoardId;
    }

    addItem(item) {
        this.items.push(item);
        renderCard(this.id);
    }

    removeItem(item) {
        this.items = this.items.filter(val => val !== item);
        renderCard(this.id);
    }

    update() {
        for (let _item of this.items) {
            _item.update();
        }
    }

    renderItems() {
        let _newItemList = document.createElement('ul');
        _newItemList.id = this.id + '-ul';
        for (let _item of this.items) {
            let _newItem = document.createElement('li');
            _newItem.id = _item.id;


            // создаем блоки
            let _firstString =  document.createElement('div');
            _firstString.classList.add('first-string')
            let _secondString =  document.createElement('div');
            _secondString.classList.add('second-string')

            
            // Название задачи
            let _newItemTitle = document.createElement('p');
            _newItemTitle.innerText = _item.title;
            _newItemTitle.classList.add('item-title', 'text-fix', 'unselectable');
            // Добавляем выбор даты
            let _newDate = document.createElement('input');
            _newDate.type = "date";            
            _newDate.classList.add('input-date');            
            
                    
            // Находим нынешнее дату и время
                // let d = new Date();
                // let day = d.getDate(); if (day<10) day='0'+day;
                // let month = d.getMonth() + 1; if (month<10) month='0'+month;
                // let year = d.getFullYear(); 
                // let today = year+"-"+month+"-"+day;

            // Доавляем метки
            let _newMarkContainer = document.createElement('span');
            _newMarkContainer.classList.add('mark-container');
            let _newMark = document.createElement('span');
            _newMark.classList.add('mark', 'blue');
            
            // Корпус для кнопок редактирования и удаления.
            let _newItemButtons = document.createElement('span');

            // Кнопка редактирования. Позволяет пользователю переименовать элемент.
            let _newItemEditButton = document.createElement('i');
            _newItemEditButton.ariaHidden = true;
            _newItemEditButton.classList.add('fa', 'fa-pencil');
            _newItemEditButton.addEventListener('click', () => {
                
                // Функциональность редактирования элементов карточки.
                let _input = document.createElement('textarea');
                _input.value = _newItemTitle.textContent;
                _input.classList.add('item-title');
                _input.maxLength = 256;
                _newItemTitle.replaceWith(_input);

                let _save = () => {
                    _item.title = _input.value;
                    renderCard(this.id);
                };

                _input.addEventListener('blur', _save, {
                    once: true,
                });
                _input.focus();
            });

            // Кнопка Удалить. Позволяет пользователю удалить элемент из карточки.
            let _newItemDeleteButton = document.createElement('i');
            _newItemDeleteButton.ariaHidden = true;
            _newItemDeleteButton.classList.add('fa', 'fa-trash');
            _newItemDeleteButton.addEventListener('click', () => {
                createConfirmDialog("Are you sure to delete this task?", () => this.removeItem(_item));
            });

            // Добавляем обе кнопки в тег span.
            _newItemButtons.appendChild(_newItemEditButton);
            _newItemButtons.appendChild(_newItemDeleteButton);

            // Добаляем заголовок, тег span к элементу и сам элемент в список.
            _newItem.appendChild(_firstString);
            _firstString.appendChild(_newItemTitle);
            _firstString.appendChild(_newItemButtons); 
            
            _newItem.appendChild(_secondString);
            _secondString.appendChild(_newDate);
            _secondString.appendChild(_newMarkContainer);           
            _newMarkContainer.appendChild(_newMark);   
            _newItemList.appendChild(_newItem);
        }

        return _newItemList;
    }

    generateElement() {
        let _newCardHeader = document.createElement('span');
        let _newCardHeaderTitle = document.createElement('h2');
        _newCardHeaderTitle.id = this.id + '-h2';
        _newCardHeaderTitle.innerText = this.name;
        _newCardHeaderTitle.classList.add('text-fix', 'card-title');

        // Мы заменяем текстовый элемент элементом ввода.
        _newCardHeaderTitle.addEventListener('click', (e) => {
            let _input = document.createElement('input');
            _input.value = _newCardHeaderTitle.textContent;
            _input.classList.add('card-title');
            _input.maxLength = 128;
            _newCardHeaderTitle.replaceWith(_input);

            let _save = () => {
                this.name = _input.value;
                renderCard(this.id);
            };

            _input.addEventListener('blur', _save, {
                once: true,
            });
            _input.focus();
        });

        // Значок меню гамбургера рядом с названием карточки для входа в контекстное меню карточки.
        let _newCardHeaderMenu = document.createElement('i');
        _newCardHeaderMenu.ariaHidden = true;
        _newCardHeaderMenu.classList.add("fa", "fa-bars");
        _newCardHeader.append(_newCardHeaderTitle);
        _newCardHeader.append(_newCardHeaderMenu);
        _newCardHeaderMenu.addEventListener('click', cardContextMenu_show);

        // Область ввода для названия новых заданий для карточки.
        let _newInput = document.createElement('input');
        _newInput.id = this.id + '-input';
        _newInput.maxLength = 256;
        _newInput.type = 'text';
        _newInput.name = "add-todo-text";
        _newInput.placeholder = "Add Task...";
        _newInput.addEventListener('keyup', (e) => {
            if (e.code === "Enter") _newButton.click();
        });

        // Кнопка рядом с вводом для преобразования текста из _new Input в фактический элемент в карточке.
        let _newButton = document.createElement('button');
        _newButton.id = this.id + '-button';
        _newButton.classList.add("plus-button");
        _newButton.innerText = '+';
        _newButton.addEventListener('click', () => {
            let _inputValue = _newInput.value;
            if (!_inputValue) return createAlert("Type a name for the item!");
            let _item = new Item(_inputValue, null, getBoardFromId(this.parentBoardId).uniqueID(), this.id);
            this.addItem(_item);
            _newInput.value = '';
            _newInput.focus();
        });

        
        let _newDate = document.querySelector
        _newDate.addEventListener('input', () => {
            let _deadline = _newDate.value;
            let _item = new Item(_inputValue, null, getBoardFromId(this.parentBoardId).uniqueID(), this.id, _deadline);
            this.addItem(_item);
            _newDate.focus();
        });

        let _newCard = document.createElement('div');
        _newCard.id = this.id;
        _newCard.classList.add('parent-card');
        _newCard.appendChild(_newCardHeader);

        if (this.items) {
            // Если в краточке есть задачи

            // Визуализируем элементы карточки.
            let _newItemList = this.renderItems();

            // Добавьте список в карточку.
            _newCard.appendChild(_newItemList);
        }

        // Добавьте ввод и кнопку для добавления нового элемента в конце.
        _newCard.appendChild(_newInput);
        _newCard.appendChild(_newButton);

        return _newCard;
    }
}

class Board {

    constructor(name, id, settings, identifier=0) {
        this.name = name;
        this.id = id;
        this.settings = settings;
        this.cards = [];  //Все карты, которые в данный момент находятся в контейнере в качестве объектов Card.
        this.identifier = identifier === null ? Date.now() : identifier;  // Все элементы на этой доске будут иметь уникальный id.
    }

    uniqueID() {
        this.identifier += 1;
        return 'e' + this.identifier.toString();
    }

    addCard() {
        let _cardTitle = e_addCardText.value;
        e_addCardText.value = '';
    
        // Если пользователь нажал кнопку, не введя никакого имени, мы по умолчанию выберем "Карточка без названия {длина карточки +1}".
        if (!_cardTitle) _cardTitle = ` To-do-list ${this.cards.length + 1}`;
    
        let _card = new Card(_cardTitle, this.uniqueID(), this.id);
        this.cards.push(_card);

        let _newCard = _card.generateElement();
        e_cardsContainer.insertBefore(_newCard, e_cardsContainer.childNodes[e_cardsContainer.childNodes.length - 2]);
    }
}

/* <=================================== Реализация Drag n' Drop ===================================> */
let cardDrag_mouseDown = false;  // Нажал ли пользователь на элемент карточки.
let cardDrag_mouseDownOn = null;  // Элемент карты, который удерживается.

const cardDrag_update = (e) => {

    // Обновляем только при удержании курсора мыши нажатой и на элементе item.
    if (!cardDrag_mouseDown && !cardDrag_mouseDownOn) return;

    // Карта должна находиться в тех же координатах, что и курсор мыши.
    // Это имитирует эффект захвата карточки курсором.
    cardDrag_mouseDownOn.style.left = e.pageX + 'px';
    cardDrag_mouseDownOn.style.top = e.pageY + 'px';
};

const cardDrag_startDragging = (e) => {

    // Захватываем только те элементы, которые являются элементами списка.
    // В противном случае мы сможем индивидуально захватывать дочерние элементы элемента списка.
    // Что довольно забавно, но это нарушает код.
    if (e.target.tagName !== 'LI') return;

    cardDrag_mouseDown = true;
    cardDrag_mouseDownOn = e.target;

   // Установим абсолютное положение элемента
   // Это позволяет нам извлечь элемент из потока документов и поиграть с его координатами.
    cardDrag_mouseDownOn.style.position = 'absolute';

    // Включаем css в стиле наведения курсора, который делает другие карты и предметы темнее при наведении курсора.
    toggleHoverStyle(true);
};

const cardDrag_stopDragging = (e) => {

    // Запускаем код остановки перетаскивания только в том случае, если ранее мышь была удержана нажатой на элементе item.
    if (!cardDrag_mouseDown) return;

    // Отключаем css в стиле наведения курсора, который предотвращает потемнение карточек и предметов при наведении курсора.
    toggleHoverStyle(false);

    let _hoverCard = getMouseOverCard();
    if (_hoverCard) {
        let _hoverItem = getMouseOverItem();

        // Достанем объект из элемента карточки, над которым наведен курсор мыши.
        let _hoverCardObject = getCardFromElement(_hoverCard);
        // Извлекаем объект из элемента item, который удерживает мышь.
        let _heldItemObject = getItemFromElement(cardDrag_mouseDownOn);
        
        if (_hoverCard === _heldItemObject.getParentCard()) {
            // Если карточка, на которую наведен курсор мыши, совпадает с родительской карточкой удерживаемого элемента
            // Нам приходится иметь дело только с вертикальным перетаскиванием.
            // То есть: Пользователь только меняет порядок расположения элементов.
            if (_hoverItem) {
                // Если на элемент наведен курсор мыши.

                if (_hoverItem !== cardDrag_mouseDownOn) {
                    // Проверяем: пока мышь не находится над перетаскиваемым элементом...
                    // Эта проверка установлена, потому что есть вероятность, что "_hover Item" в конечном итоге окажется удерживаемым элементом.
                    let _hoverItemObject = getItemFromElement(_hoverItem);
                    // Переместите положение удерживаемого элемента в положение того элемента, над которым был наведен курсор.
                    // Это приведет к перемещению элемента, над которым был наведен курсор, вниз, а удерживаемый элемент займет его место.
                    _hoverCardObject.items.move(_hoverCardObject.items.indexOf(_heldItemObject), _hoverCardObject.items.indexOf(_hoverItemObject));
                }
            }

            renderCard(_heldItemObject.getParentCard().id);

        } else {
        // Если карточка, на которую наведен курсор мыши, не совпадает с родительской карточкой удерживаемого элемента.
        // Пользователь также получает возможность переместить элемент с другой карточки.
        // // Итак, здесь мы будем иметь дело с обеими логиками, то есть: между карточками и перемещением элемента при наведении курсора на одну из них.

            if (_hoverItem) {
                // Если на элемент наведен курсор мыши.

                if (_hoverItem !== cardDrag_mouseDownOn) {
                    // До тех пор, пока курсор мыши не находится над перетаскиваемым элементом.

                    let _hoverItemObject = getItemFromElement(_hoverItem);

                    // Получаем объект родительской карточки элемента, на который наведен курсор мыши.
                    let _hoverItemParentObject = getCardFromElement(_hoverItemObject.getParentCard());

                    // Вставляем удерживаемый элемент в положение элемента, над которым был наведен курсор.
                    // Это приведет к перемещению элемента, на который наведен курсор, вниз, а удерживаемый элемент займет свое место.
                    _hoverItemParentObject.items.insert(_hoverItemParentObject.items.indexOf(_hoverItemObject), _heldItemObject);

                    // Извлекаем удерживаемый итем из его оригинальной карточки.
                    getCardFromElement(_heldItemObject.getParentCard()).removeItem(_heldItemObject);
                    // Присваиваем удерживаемому предмету новый id родительской карточки.
                    _heldItemObject.parentCardId = _hoverItemParentObject.id;
                }
            } else {
                // Если элемент не был удержан, а вместо него была только карточка.

                // Перемещем удерживаемый элемент в список элементов на наведенной карточке.
                _hoverCardObject.items.push(_heldItemObject);

                // Извлекаем удерживаемый итем из его оригинальной карточки.
                getCardFromElement(_heldItemObject.getParentCard()).removeItem(_heldItemObject);
                // Присваиваем удерживаемому предмету новый id родительской карточки.
                _heldItemObject.parentCardId = _hoverCardObject.id;
            }

            renderCard(_hoverCardObject.id);
            renderCard(_heldItemObject.getParentCard().id);
        }
        // renderAllCards();
        // renderCard(originCard);
        // renderCard(targetCard);
    }
    cardDrag_mouseDown = false;
    cardDrag_mouseDownOn.style.position = 'static';
    cardDrag_mouseDownOn = null;
};

// Добавляем прослушиватели событий.
// ПРИМЕЧАНИЕ03: Было бы лучшей идеей создать единую функцию mouseMove/mouseLeave/mouseUp
// для обработки как прокрутки перетаскивания, так и перетаскивания элемента карточки.
// Это сэкономит ненужную обработку + уменьшит количество прослушивателей событий.
e_mainContainer.addEventListener('mousemove', cardDrag_update);
e_mainContainer.addEventListener('mouseleave', cardDrag_stopDragging, false);
window.addEventListener('mouseup', cardDrag_stopDragging, false);

/* <=================================== Прокрутка перетаскиванием ===================================> */
// Эта функция позволяет пользователю удерживать и перетаскивать основной контейнер карточек для прокрутки вместо того, чтобы удерживать полосу прокрутки.
// Спасибо Trello, но это действительно удобно.

let scroll_mouseDown = false;
let scroll_startX, scroll_scrollLeft;

const scroll_startDragging = (e) => {
    scroll_mouseDown = true;
    scroll_startX = e.pageX - e_mainContainer.offsetLeft;
    scroll_scrollLeft = e_mainContainer.scrollLeft;
};

const scroll_stopDragging = (e) => {
    scroll_mouseDown = false;
};

const scroll_update = (e) => {
    e.preventDefault();
    if(!scroll_mouseDown || cardDrag_mouseDown) return;

    let _scroll = (e.pageX - e_mainContainer.offsetLeft) - scroll_startX;
    e_mainContainer.scrollLeft = scroll_scrollLeft - _scroll;
};

// Добавляем слушатели событий
e_mainContainer.addEventListener('mousemove', scroll_update);
e_mainContainer.addEventListener('mousedown', scroll_startDragging, false);
e_mainContainer.addEventListener('mouseup', scroll_stopDragging, false);
e_mainContainer.addEventListener('mouseleave', scroll_stopDragging, false);


/* <=================================== Контекстное меню карточки ===================================> */


let cardContextMenu_currentCard;
const cardContextMenu_show = (e) => {

    cardContextMenu_currentCard = getMouseOverCard();

    const { clientX: mouseX, clientY: mouseY } = e;
    e_cardContextMenu.style.top = mouseY + 'px';
    e_cardContextMenu.style.left = mouseX + 'px';

    e_cardContextMenu.classList.remove('visible');
    setTimeout(() => {
        e_cardContextMenu.classList.add('visible');
    });

};

const cardContextMenu_hide = (e) => {
    // Пока пользователь не нажимает на контекстное меню, мы можем скрывать его.
    if (e.target.offsetParent != e_cardContextMenu && e_cardContextMenu.classList.contains('visible')) {
        e_cardContextMenu.classList.remove("visible");
    }
};

const cardContextMenu_clearCard = () => {
    createConfirmDialog('Are you sure to clear this board', () => {
        let _currentCardObject = getCardFromElement(cardContextMenu_currentCard);

        _currentCardObject.items.length = 0;
        renderCard(_currentCardObject.id);
    });
};

const cardContextMenu_deleteCard = () => {
    createConfirmDialog('Are you sure to delete this card', () => {
        let _currentCardObject = getCardFromElement(cardContextMenu_currentCard);

        // Удаляем карточку из списка карточек в зависимости от ее индекса.
        currentCards().splice(currentCards().indexOf(_currentCardObject), 1);
        cardContextMenu_hide({target:{offsetParent:'n/a'}}); 

        renderCard(_currentCardObject.id);
    });
}

const cardContextMenu_duplicateCard = () => {
    let _currentCardObject = getCardFromElement(cardContextMenu_currentCard);

    currentBoard().addCard();

    let _cIndex = currentBoard().cards.length - 1;
    currentBoard().cards[_cIndex].items = _currentCardObject.items;
    currentBoard().cards[_cIndex].name = _currentCardObject.name + ' Copy';

    renderCard(currentBoard().cards[_cIndex].id);
}


document.body.addEventListener('click', cardContextMenu_hide);
e_cardContextMenuClear.addEventListener('click', cardContextMenu_clearCard);
e_cardContextMenuDelete.addEventListener('click', cardContextMenu_deleteCard);
e_cardContextMenuDuplicate.addEventListener('click', cardContextMenu_duplicateCard);

/* <=================================== Постоянное хранение данных ===================================> */
function saveData() {
    window.localStorage.setItem('kards-appData', JSON.stringify(appData));
}

function getDataFromLocalStorage() {
    return window.localStorage.getItem('kards-appData');
}

function loadData() {
    let _data = window.localStorage.getItem('kards-appData');
    if (_data) {
        let _appData = JSON.parse(_data);

        // Поскольку JSON не хранит функции и тому подобное.
        // Нам придется повторно инициализировать классы с загруженными данными.
        appData.settings = _appData.settings;
        appData.currentBoard = _appData.currentBoard >= 0 ? appData.currentBoard : 0;
        appData.identifier = _appData.identifier !== null ? appData.identifier : 0;
        
        // Заполняем данные досками.
        for (let _board of _appData.boards) {
            let _newBoard = new Board(_board.name, _board.id, _board.settings, _board.identifier);

            // Заполняем данные карточками.
            for (let _card of _board.cards) {
                let _newCard = new Card(_card.name, _card.id, _board.id);

                //Заполняем данные задачами.
                for (let _item of _card.items) {
                    let _newItem = new Item(_item.title, _item.description, _item.id, _card.id);
                    // Вставляем задачу в карточку.
                    _newCard.items.push(_newItem);
                }
                //Вставляем карточку в доску..
                _newBoard.cards.push(_newCard);
            }
            // Вставляем доску в данные.
            appData.boards.push(_newBoard);
        }

        // Сгенерируем доску
        renderBoard(appData.boards[appData.currentBoard]);
    } else {
        appData.currentBoard = 0;
        let _defaultBoard = new Board("Untitled Board", 'b0', {'theme': null});
        appData.boards.push(_defaultBoard);
    }
    listBoards();
}

function clearData() {
    window.localStorage.clear();
}

loadData();

/* <=================================== Другие события ===================================> */
e_addCardText.addEventListener('keyup', (e) => {
    if (e.code === "Enter") currentBoard().addCard();
});

e_addCardButton.addEventListener('click', () => currentBoard().addCard());

e_addBoardText.addEventListener('keyup', (e) => {
    if (e.code === "Enter") addBoard();
});

e_addBoardButton.addEventListener('click', addBoard);

e_autoSaveButton.addEventListener('change',  function (event) {
    if (this.checked) {
        autoSaveInternalId = setInterval(function (){
            saveData();
        }, 5000);
    } else {
        window.clearInterval(autoSaveInternalId);
    }
})
e_saveButton.addEventListener('click', () => {saveData(); createAlert("Data successfully saved.")});

e_deleteButton.addEventListener('click', () => {
    createConfirmDialog('Are you sure to delete this board?', () => {
        let _boardName = currentBoard().name;

        // Удалить текущую доску.
        appData.boards.splice(appData.currentBoard, 1);
        if (appData.currentBoard !== 0) {
            appData.currentBoard--;
        }

        if (appData.boards.length === 0) {
            let _defaultBoard = new Board("Untitled Board", 'b0', {'theme': null});
            appData.boards.push(_defaultBoard);
            appData.currentBoard = 0;
        }

        listBoards();
        renderBoard(appData.boards[appData.currentBoard]);

        createAlert(`Deleted board "${_boardName}"`)
    });
});

window.onbeforeunload = function () {
    if (JSON.stringify(appData) !== getDataFromLocalStorage()) {
        return confirm();
    }
}
/* <=================================== Сайдбар ===================================> */
function toggleSidebar() {
    if (('toggled' in e_sidebar.dataset)) {
        delete e_sidebar.dataset.toggled;
        e_sidebar.style.width = "0";
        e_sidebar.style.boxShadow = "unset";

        // Удалить прослушивание событий по клику за пределами сайдбара
        document.removeEventListener('click', listenClickOutside);
    } else {
        e_sidebar.dataset.toggled = '';
        e_sidebar.style.width = "250px";
        e_sidebar.style.boxShadow = "100px 100px 0 100vw rgb(0 0 0 / 50%)";
        // Обработчик клика за пределами боковой панели
        setTimeout(() => {
            document.addEventListener('click', listenClickOutside);
        }, 300);
    }
}

e_sidebarButton.addEventListener('click', toggleSidebar);
e_sidebarClose.addEventListener('click', toggleSidebar);

/* Оповещения */

function createAlert(text) {
    let _e = document.createElement('div');
    let _p = document.createElement('p');
    _p.innerText = text;
    _e.classList.add('alert');
    _e.appendChild(_p);

    e_alerts.appendChild(_e);
    setTimeout(function(){
        _e.classList.add('animate-hidden');
    }, 3500);
    setTimeout(function(){
        _e.parentNode.removeChild(_e);
    }, 4500);
}

function listenClickOutside(event) {
    const _withinBoundaries = event.composedPath().includes(e_sidebar);
    if (!_withinBoundaries && e_sidebar.style.width === "250px") {
        toggleSidebar();
    }
}

function createConfirmDialog(text, onConfirm) {

    // Скрываем все контекстные меню, которые могут быть открыты.
    cardContextMenu_hide({target:{offsetParent:'n/a'}});

    let _modal = document.getElementById("confirm-dialog");
    let _span = document.getElementById("confirm-dialog-close");
    let _dialogText = document.getElementById('confirm-dialog-text');
    let _cancelButton = document.getElementById('confirm-dialog-cancel');
    let _confirmButton = document.getElementById('confirm-dialog-confirm');

    _modal.style.display = "block";
    _dialogText.textContent = text;

    _span.onclick = function() {
        _modal.style.display = "none";
    }
    
    _cancelButton.onclick = () => {
        _modal.style.display = "none";
    }

    _confirmButton.onclick = () => {
        _modal.style.display = "none";
        onConfirm && onConfirm();
    }

    window.onclick = (event) => {
        if (event.target === _modal) {
            _modal.style.display = "none";
        }
    }
}