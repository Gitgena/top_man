class TopMan {
    constructor(app) {
        this.app = app;
        this.url = 'https://lsbot.meloman.kz/top-sale-report/41dd21109c8b8145866a6c63a04cb5b72ad12e35abcdd71eb0e2a61f0bdf2c47';
    }

    async getDataByUrl() {
        try {
            const response = await fetch(this.url);

            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
        }
    }    

    splitNumberByThousands() {
        const splitPriceElements = document.querySelectorAll('[data-split-price]');
        splitPriceElements.forEach(element => {
            const originalNumber = parseFloat(element.textContent);
            if (!isNaN(originalNumber)) {
                const formattedNumber = originalNumber.toLocaleString('en-US').replace(',', ' ');
                element.textContent = formattedNumber;
            }
        });
    }

    renderAccordion() {
        const comments = this.app.querySelectorAll('.nested-accordion .open-accordeon');
        comments.forEach(comment => comment.style.display = 'none');
    
        const headers = this.app.querySelectorAll('.nested-accordion h6');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const comment = header.nextElementSibling;
                comment.style.display = comment.style.display === 'none' ? 'block' : 'none';
                header.classList.toggle('selected');
            });
        });
    }

    shopTemplate(data) {
        let template = '';
        if (data) {
            data.forEach((lvl, index) => {
                if (lvl?.sectionHeaderText) {
                    const newData = Object.values(lvl).filter(val => val?.constructor == Object);
                    template += this.returnMainTemplate(lvl, newData.length > 0, index);
                    if (newData.length > 0) {
                        template = template.replace('<!-- Replace -->', this.shopTemplate(newData));
                    }
                }
            });
        }
        return template;
    }    

    allShops(data) {
        data.forEach((shop) => {
            const template = this.shopTemplate(Object.values(shop));
            this.app.innerHTML += template;
        })
    }

    getItemsTemplate(data, index) {
        let template = `<ul class="inner-tables__list">`;

        data.forEach((item) => {
            if(index < 2) {
                template += `
                <li class="inner-tables__line">
                    <div class="inner-tables__left">
                        <a href="${item.link}" class="inner-tables__link" target="_blank">${item.itemName}</a>
                    </div>
                    <div class="inner-tables__right">
                        <div class="inner-tables__qty">${item.quantity}</div>
                        <div class="inner-tables__sum">
                            <span data-split-price>${item.total}</span> /
                            <span data-split-price>${item.discountedTotal}</span>
                        </div>
                    </div>
                </li>
            `;
            }else {
                template += `
                <li class="inner-tables__line">
                    <div class="inner-tables__left">
                        <a href="${item.link}" class="inner-tables__link">${item.itemName}</a>
                    </div>
                    <div class="inner-tables__right">
                        <div class="inner-tables__qty">${item.piecesCount}</div>
                        <div class="inner-tables__sum">
                            <span data-split-price>${item.itemPriceAverage}</span> /
                            <span data-split-price>${item.itemDiscountedPriceAverage}</span>
                        </div>
                    </div>
                </li>
            `;
            }
        })
            
        template +=  `</ul>`;

        return template;
    }

    getTableTemplate(data, title, tableHeaders, itemInfoHeaders, index, lvl) {
        let template = `
            <div class='nested-accordion'>
                <h6>${title}</h6>
                <div class='open-accordeon'>
                    <div class='nested-accordion'>
                    <div class="tables-header">
                        ${this.getTableHeaderContent(itemInfoHeaders)}
                    </div>
        `;

        data.sort((a, b) => {
            if (lvl.sectionHeaderText === 'Big Check Top 3') {
                return b.discountedTotal - a.discountedTotal;
            } else if (lvl.sectionHeaderText === 'Long Check Top 3') {
                return b.distinctItems - a.distinctItems;
            } else if (lvl.sectionHeaderText === 'Visits Top 5') {
                return b.numberOfVisits - a.numberOfVisits;
            } else if (lvl.sectionHeaderText === 'Sales Top 5') {
                return b.itemsCount - a.itemsCount;
            } else {
                return 0;
            }
        });

        data.forEach((item) => {
            if(index < 2) {
                template += `
                <div class='nested-accordion'><h6>
                    <div class="main-tables">
                        <div class="main-tables__discountedTotal" data-split-price>${item.discountedTotal}</div>
                        <div class="main-tables__distinctItems">${item.distinctItems}</div>
                        <div class="main-tables__shopCaption">${item.shopCaption}</div>
                        <div class="main-tables__customerId">${item.customerId}</div>
                    </div>
                    </h6>
                    <div class='open-accordeon'>
                        <div class="inner-tables">
                            <div class="inner-tables__header">
                               ${this.getTableHeaderContentHead(tableHeaders)}
                            </div>
                            ${this.getItemsTemplate(item.items, index)}
                            <div class="inner-tables__info">
                                <div>Итого / со скидкой:
                                    <strong>
                                        <span data-split-price>${item.total}</span> /
                                        <span data-split-price>${item.discountedTotal}</span>
                                    </strong>
                                </div>
                                <div>Бонусов списано: <strong>${item.bonusesUsed}</strong></div>
                                <div>Бонусов начислено <strong data-split-price>${item.bonusesGiven}</strong></div>
                                <div>Транзакция: <strong>${item.transactionId}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }else {
                template += `
                <div class='nested-accordion'><h6>
                    <div class="main-tables">
                        <div class="main-tables__customerId2">${item.customerId}</div>
                        <div class="main-tables__numberOfVisits">${item.numberOfVisits}</div>
                        <div class="main-tables__itemsCount">${item.itemsCount}</div>
                        <div class="main-tables__discountedTotal2" data-split-price>${item.discountedTotal}</div>
                    </div>
                    </h6>
                    <div class='open-accordeon'>
                        <div class="inner-tables">
                            <div class="inner-tables__header">
                               ${this.getTableHeaderContentHead(tableHeaders)}
                            </div>
                            ${this.getItemsTemplate(item.items)}
                            <div class="inner-tables__info">
                                <div>Бонусов списано: <strong>${item.bonusesUsed}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }
            
        });
        
        template += `
                    </div>
                </div>    
            </div>        
        `;

        return template;
    }

    returnMainTemplate(lvl, nested, index) {
        let template = `
            <div class='nested-accordion'>
                <h6>${lvl.sectionHeaderText}</h6>
                <div class='open-accordeon under'>
                    <!-- open-accordeon START -->
                    ${nested ? '<!-- Replace -->' : ''}
                    ${lvl.yesterday ? this.getTableTemplate(lvl.yesterday, 'Вчера', lvl.itemTableHeaders, lvl.itemInfoHeaders, index, lvl) : ''}
                    ${lvl.week ? this.getTableTemplate(lvl.week, 'Неделя', lvl.itemTableHeaders,lvl.itemInfoHeaders, index, lvl) : ''}
                    ${lvl.month ? this.getTableTemplate(lvl.month, 'Месяц', lvl.itemTableHeaders,lvl.itemInfoHeaders, index, lvl) : ''}
                    ${lvl._30Days ? this.getTableTemplate(lvl._30Days, '30 дней', lvl.itemTableHeaders, lvl.itemInfoHeaders, index, lvl) : ''}
                    ${lvl._90Days ? this.getTableTemplate(lvl._90Days, '90 дней', lvl.itemTableHeaders, lvl.itemInfoHeaders, index, lvl) : ''}
                    <!-- open-accordeon END -->
                </div>
            </div>
        `;
        return template;
    }
    
    getTableHeaderContent(headers) {
        let headerContent = '';
        if (headers) {
            Object.keys(headers).forEach(headerKey => {
                headerContent += `<div>${headers[headerKey]}</div>`;
            });
        }
        return headerContent;
    }
    
    getTableHeaderContentHead(headers) {
        let headerContentLeft = '';
        let headerContentRight = '';
    
        if (headers) {
            Object.keys(headers).forEach((headerKey, index) => {
                const headerDiv = `<div>${headers[headerKey]}</div>`;
                index === 0 ? headerContentLeft = headerDiv : headerContentRight += headerDiv;
            });
        }
    
        const finalHeaderContent = `
            <div class="inner-tables__header--left">${headerContentLeft}</div>
            <div class="inner-tables__header--right">${headerContentRight}</div>
        `;
    
        return finalHeaderContent;
    }
    
}


document.addEventListener('DOMContentLoaded', () => {
    
    const exempleTopMan = new TopMan(document.getElementById('app'));

    async function fetchDataAndUse() {
        const data = await exempleTopMan.getDataByUrl();
        exempleTopMan.allShops(data);
        exempleTopMan.renderAccordion();
        exempleTopMan.splitNumberByThousands();
    }

    fetchDataAndUse();

    setTimeout(() => {
        document.body.classList.add("loaded");
    }, 1000);

});

   
