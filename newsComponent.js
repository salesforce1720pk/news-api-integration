import { LightningElement, track } from 'lwc';
import retriveNews from '@salesforce/apex/NewsAppController.retriveNews';
import myResource from '@salesforce/resourceUrl/newsImage';

export default class NewsComponent extends LightningElement {
    staticImg = myResource;

    @track result = [];
    @track displayedNews = [];

    
    category = 'all';
    fromDate = '';
    toDate = '';
    language = 'en';
    keywords = 'tech'; 

    
    currentPage = 1;
    pageSize = 4;
    totalPages = 0;

    
    categoryOptions = [
        { label: 'All', value: 'all' },
        { label: 'Crime', value: 'crime' },
        { label: 'Tech', value: 'technology' }
    ];

    languageOptions = [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' },
        { label: 'Italian', value: 'it' }
    ];

    connectedCallback() {
        this.fetchNews();
    }

    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
    }

    fetchNews() {
        retriveNews({
            category: this.category,
            fromDate: this.fromDate,
            toDate: this.toDate,
            language: this.language,
            keywords: this.keywords
        })
            .then(response => {
                if (response && response.articles) {
                    this.formatNewsData(response.articles);
                } else {
                    this.result = [];
                    this.displayedNews = [];
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    formatNewsData(res) {
        this.result = res.map((item, index) => {
            let id = `news_${index + 1}`;
            let publishDate = new Date(item.publishedAt).toLocaleString();
            let newsTitle = item.title;
            let imageURL = item.urlToImage
                ? `https://images.weserv.nl/?url=${encodeURIComponent(item.urlToImage)}`
                : this.staticImg;
            let articleURL = item.url;
            return { ...item, id, newsTitle, publishDate, imageURL, articleURL };
        });

        this.totalPages = Math.ceil(this.result.length / this.pageSize);
        this.updateDisplayedNews();
    }

    updateDisplayedNews() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.displayedNews = this.result.slice(start, end);
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateDisplayedNews();
        }
    }

    handlePrev() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplayedNews();
        }
    }

    get isPrevDisabled() {
        return this.currentPage === 1;
    }

    get isNextDisabled() {
        return this.currentPage === this.totalPages;
    }
}
