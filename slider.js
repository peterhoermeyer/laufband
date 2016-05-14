var SliderImage = React.createClass({
    render: function () {
        var translate = this.props.translate;

        return (
            <img className="sliderImage" data-item-idx={this.props.itemIdx} src={this.props.url} style={{ position: 'absolute', left: this.props.position.left + 'px', transition: 'transform .5s', transform: 'translate(' + translate.x + 'px,' + translate.y + ')' }} onLoad={this.props.onItemLoad} />
        );
    }
});

var Slider = React.createClass({
    numItemsLoaded: 0,
    DOMNode: null,

    getInitialState: function () {
        var items = this.props.items.map(function (item, idx) {
            return {
                url: item,
                key: idx,
                translate: { x: 0, y: 0 },
                position: {
                    left: 0
                }
            }
        });
        return ({
            items: items
        });
    },

    componentWillMount: function () {
        // TODO: replace html buttons with components
        this.btnLeft = document.getElementById(this.props.btnLeft);
        this.btnLeft.addEventListener('click', this.goLeft, false);
        //this.btnRight = document.getElementById(this.props.btnRight);
        //this.btnRight.addEventListener('click', this.goRight, false);
    },
    
    componentDidMount: function() {
        this.DOMNode = ReactDOM.findDOMNode(this); 
    },
    
    /**
     * Slide left
     */
    goLeft: function () {
        var distance = -this.calcScrollDistance(this.state.items, true);
        this.reArrangeItems(this.state.items, distance);
    },

    goRight: function () {
        var distance = -this.calcScrollDistance(this.state.items, false, true);
        this.reArrangeItems(this.state.items, distance);
    },

    onItemLoad: function (ev) {
        this.state.items[ev.target.dataset.itemIdx].width = ev.target.width;
        this.numItemsLoaded = this.numItemsLoaded + 1;
        if (this.numItemsLoaded === this.state.items.length) {
            this.initItemPositions(this.state.items);
        }
    },

    /**
     * Sets starting positions to all scroll items
     */
    initItemPositions: function (items) {
        var left = 0;
        var initItems = items.map(function (item) {
            item.position.left = left;
            left = item.width + left;
            return item;
        });
        this.setState({
            items: initItems
        });
    },

    calcScrollDistance: function (items, goLeft, goRight) {
        var addedDistance = 0;
        if (goLeft) {
            for (var i = 0, len = items.length; i < len; i += 1) {
                if (items[i].position.left + items[i].translate.x + items[i].width > 0) {

                    addedDistance = items[i].width;
                    return addedDistance; // TODO: enable scrolling more than one item!
                }
            };
        }

        return addedDistance;
    },
    
    /**
     * React to scroll events by re-arranging all item positions.
     */
    reArrangeItems: function (items, distance) {
        // search for items that are already outside the visible space
        // and put those onto the glue array after calculating their new css position
        var newlyOrderedItems = [];
        var glueItems = [];
        items.forEach(function (item) {
            if (item.position.left + item.translate.x + item.width < this.DOMNode.offsetLeft) {
                item.position.left = items[items.length - 1].position.left + items[items.length - 1].translate.x + items[items.length - 1].width;
                item.translate = {x: 0, y: 0};
                glueItems.push(item);
            }
            // TODO: test for items leaving to the right
            else {
                newlyOrderedItems.push(item);
            }
        }, this);

        // concat the glued array and set translation values to all item
        var allItems = newlyOrderedItems.concat(glueItems);
        allItems.forEach(function (item) {
            item.translate.x = item.translate.x + distance;
        });

        // trigger view refresh
        this.setState({
            items: allItems
        });
    },

    render: function () {
        var self = this;
        var renderItems = this.state.items.map(function (item, index) {
            return (
                <SliderImage url={self.props.folder + '/' + item.url} key={item.key} itemIdx={item.key} position={item.position} translate={item.translate} onItemLoad={self.onItemLoad} />
            );
        });

        return (
            <div className="sliderComponent" style={{ width: '480px', height: '200px', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '8480px', height: '200px', overflow: 'hidden' }}>
                    {renderItems}
                </div>
            </div>
        );
    }
});

var items = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'];

ReactDOM.render(
    <Slider items={items} folder="images" btnLeft="btn-left" btnRight="btn-right"/>,
    document.getElementById('slide-container')
);