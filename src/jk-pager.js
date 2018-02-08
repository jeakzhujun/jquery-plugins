/**
 * Created by shxy on 2018/1/23.
 */
;(function ($, window, document, undefined) {
    var old = $.fn.jkPager;


    // PROTOTYPE AND CONSTRUCTOR

    var JKPager = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.jkPager.defaults, options);
        this.pagerElement = this.$element;
        if (this.options.startPage < 1 || this.options.startPage > this.options.totalPages) {
            //throw new Error('Start page option is incorrect');
        }

        this.options.totalPages = parseInt(this.options.totalPages);
        if (isNaN(this.options.totalPages)) {
            throw new Error('Total pages option is not correct!');
        }

        this.options.visiblePages = parseInt(this.options.visiblePages);
        if (isNaN(this.options.visiblePages)) {
            throw new Error('Visible pages option is not correct!');
        }

        if (this.options.onPageClick instanceof Function) {
            this.pagerElement.first().on('page', this.options.onPageClick);
        }

        // hide if only one page exists
        if (this.options.hideOnlyOnePage && this.options.totalPages == 1) {
            this.pagerElement.trigger('page', 1);
            return this;
        }

        if (this.options.totalPages < this.options.visiblePages) {
            this.options.visiblePages = this.options.totalPages;
        }

        if (this.options.href) {
            this.options.startPage = this.getPageFromQueryString();
            if (!this.options.startPage) {
                this.options.startPage = 1;
            }
        }

        var tagName = (typeof this.pagerElement.prop === 'function') ?
            this.pagerElement.prop('tagName') : this.pagerElement.attr('tagName');

        if (tagName === 'UL') {
            this.$listContainer = this.pagerElement;
        } else {
            this.$listContainer = $('<ul></ul>');
        }

        this.$listContainer.addClass(this.options.paginationClass);

        if (tagName !== 'UL') {
            this.pagerElement.append(this.$listContainer);
        }

        if (this.options.initiateStartPageClick) {
            debugger;
            this.show(this.options.startPage);
        } else {
            this.currentPage = this.options.startPage;
            this.render(this.getPages(this.options.startPage));
            this.setupEvents();
        }

        return this;
    };

    JKPager.prototype = {

        constructor: JKPager,

        destroy: function () {
            this.pagerElement.empty();
            this.pagerElement.removeData('jk-pagination');
            this.pagerElement.off('page');

            return this;
        },

        show: function (page) {
            if (page < 1 || page > this.options.totalPages) {
                throw new Error('Page is incorrect.');
            }
            this.currentPage = page;

            this.render(this.getPages(page));
            this.setupEvents();

            this.pagerElement.trigger('page', page);

            return this;
        },

        enable: function () {
            this.show(this.currentPage);
        },

        disable: function () {
            var _this = this;
            this.$listContainer.off('click').on('click', 'li', function (evt) {
                evt.preventDefault();
            });
            this.$listContainer.children().each(function () {
                var $this = $(this);
                if (!$this.hasClass(_this.options.activeClass)) {
                    $(this).addClass(_this.options.disabledClass);
                }
            });
        },

        buildListItems: function (pages) {
            var listItems = [];

            if (this.options.first) {
                listItems.push(this.buildItem('first', 1));
            }

            if (this.options.prev) {
                var prev = pages.currentPage > 1 ? pages.currentPage - 1 : this.options.loop ? this.options.totalPages  : 1;
                listItems.push(this.buildItem('prev', prev));
            }

            for (var i = 0; i < pages.numeric.length; i++) {
                listItems.push(this.buildItem('page', pages.numeric[i]));
            }

            if (this.options.next) {
                var next = pages.currentPage < this.options.totalPages ? pages.currentPage + 1 : this.options.loop ? 1 : this.options.totalPages;
                listItems.push(this.buildItem('next', next));
            }

            if (this.options.last) {
                listItems.push(this.buildItem('last', this.options.totalPages));
            }

            if (this.options.pageInfo) {
                listItems.push(this.buildItem('pageInfo', this.options.pageInfo.replace(/_START_/g,pages.start).replace(/_END_/g,pages.end).replace(/_TOTAL_/g,this.options.totalCounts)));
            }
            return listItems;
        },

        buildItem: function (type, page) {
            var $itemContainer = null;
            if(type==='pageInfo'){
                $itemContainer = $('<li></li>');

                $itemContainer.addClass(this.options[type + 'Class']);
                $itemContainer.data('page', page);
                $itemContainer.data('page-type', type);
                $itemContainer.html(page);
            }else{
                $itemContainer = $('<li></li>'),
                    $itemContent = $('<a></a>'),
                    itemText = this.options[type] ? this.makeText(this.options[type], page) : page;

                $itemContainer.addClass(this.options[type + 'Class']);
                $itemContainer.data('page', page);
                $itemContainer.data('page-type', type);
                $itemContainer.append($itemContent.attr('href', this.makeHref(page)).addClass(this.options.anchorClass).html(itemText));
            }

            return $itemContainer;
        },

        getPages: function (currentPage) {

            var pages = [];

            var half = Math.floor(this.options.visiblePages / 2);
            var startVisiblePages = currentPage - half + 1 - this.options.visiblePages % 2;
            var endVisiblePages = currentPage + half;

            // handle boundary casepageSize
            if (startVisiblePages <= 0) {
                startVisiblePages = 1;
                endVisiblePages = this.options.visiblePages;
            }
            if (endVisiblePages > this.options.totalPages) {
                startVisiblePages = this.options.totalPages - this.options.visiblePages + 1;
                endVisiblePages = this.options.totalPages;
            }

            var itPage = startVisiblePages;
            while (itPage <= endVisiblePages) {
                pages.push(itPage);
                itPage++;
            }
            var end = this.options.pageSize * currentPage;
            if(end>this.options.totalCounts){
                end = this.options.totalCounts;
            }
            return {"currentPage": currentPage, "numeric": pages,"start":1 + (this.options.pageSize * (currentPage - 1)),"end":end};
        },

        render: function (pages) {
            var _this = this;
            this.$listContainer.children().remove();
            var items = this.buildListItems(pages);
            if(_this.options.isPagerDesc){
                $.each(items, function(key, item){
                    _this.$listContainer.append(item);
                });
            }else{
                for (var i = items.length; i >=0; i--) {
                    _this.$listContainer.append(items[i]);
                }
            }

            this.$listContainer.children().each(function () {
                var $this = $(this),
                    pageType = $this.data('page-type');

                switch (pageType) {
                    case 'page':
                        if ($this.data('page') === pages.currentPage) {
                            $this.addClass(_this.options.activeClass);
                        }
                        break;
                    case 'first':
                        $this.toggleClass(_this.options.disabledClass, pages.currentPage === 1);
                        break;
                    case 'last':
                        $this.toggleClass(_this.options.disabledClass, pages.currentPage === _this.options.totalPages);
                        break;
                    case 'prev':
                        $this.toggleClass(_this.options.disabledClass, !_this.options.loop && pages.currentPage === 1);
                        break;
                    case 'next':
                        $this.toggleClass(_this.options.disabledClass,
                            !_this.options.loop && pages.currentPage === _this.options.totalPages);
                        break;
                    default:
                        break;
                }

            });
        },

        setupEvents: function () {
            var _this = this;
            this.$listContainer.off('click').on('click', 'li', function (evt) {
                var $this = $(this);
                if ($this.hasClass(_this.options.disabledClass) || $this.hasClass(_this.options.activeClass)) {
                    return false;
                }
                // Prevent click event if href is not set.
                !_this.options.href && evt.preventDefault();
                _this.show(parseInt($this.data('page')));
            });
        },

        makeHref: function (page) {
            return this.options.href ? this.generateQueryString(page) : "#";
        },

        makeText: function (text, page) {
            return text.replace(this.options.pageVariable, page)
                .replace(this.options.totalPagesVariable, this.options.totalPages)
        },
        getPageFromQueryString: function (searchStr) {
            var search = this.getSearchString(searchStr),
                regex = new RegExp(this.options.pageVariable + '(=([^&#]*)|&|#|$)'),
                page = regex.exec(search);
            if (!page || !page[2]) {
                return null;
            }
            page = decodeURIComponent(page[2]);
            page = parseInt(page);
            if (isNaN(page)) {
                return null;
            }
            return page;
        },
        generateQueryString: function (pageNumber, searchStr) {
            var search = this.getSearchString(searchStr),
                regex = new RegExp(this.options.pageVariable + '=*[^&#]*');
            if (!search) return '';
            return '?' + search.replace(regex, this.options.pageVariable + '=' + pageNumber);

        },
        getSearchString: function (searchStr) {
            var search = searchStr || window.location.search;
            if (search === '') {
                return null;
            }
            if (search.indexOf('?') === 0) search = search.substr(1);
            return search;
        },
        getCurrentPage: function () {
            return this.currentPage;
        }
    };

    // PLUGIN DEFINITION

    $.fn.jkPager = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        var methodReturn;

        var $this = $(this);
        var data = $this.data('jk-pagination');
        var options = typeof option === 'object' ? option : {};

        if (!data) $this.data('jk-pagination', (data = new JKPager(this, options) ));
        if (typeof option === 'string') methodReturn = data[ option ].apply(data, args);

        return ( methodReturn === undefined ) ? $this : methodReturn;
    };

    $.fn.jkPager.defaults = {
        totalPages: 1,
        startPage: 1,
        visiblePages: 7,
        initiateStartPageClick: false,
        isPagerDesc:false,
        hideOnlyOnePage: false,
        href: false,
        pageVariable: '{{page}}',
        totalPagesVariable: '{{total_pages}}',
        page: null,
        first: '首页',
        prev: '上一页',
        next: '下一页',
        last: '尾页',
        pageInfo: '显示第_START_至_END_项结果，共_TOTAL_项',
        loop: false,
        onPageClick: null,
        paginationClass: 'pagination width-100',
        nextClass: 'page-item next pull-right',
        prevClass: 'page-item prev pull-right',
        lastClass: 'page-item last pull-right',
        pageInfoClass: 'page-item page-info disabled pull-left',
        firstClass: 'page-item first pull-right',
        pageClass: 'page-item pull-right',
        activeClass: 'active',
        disabledClass: 'disabled',
        anchorClass: 'page-link'
    };

    $.fn.jkPager.Constructor = JKPager;

    $.fn.jkPager.noConflict = function () {
        $.fn.jkPager = old;
        return this;
    };

    $.fn.jkPager.version = "1.0.0";

})(window.jQuery, window, document);