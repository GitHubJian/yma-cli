type EventCrumb = {
    category: string;
    message: string;
};

type UrlChangeCrumb = {
    category: string;
    data: {
        to: string;
        from: string;
    };
};

type XHRSendCrumb = {
    type: 'http';
    category: 'xhr';
};
