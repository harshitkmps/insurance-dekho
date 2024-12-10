import React, { Component } from 'react'
import classNames from 'classnames'

class CardV2 extends Component {
    render() {
        const {
            className,
            tag: Tag,
            radius,
            text,
            width,
            bottom,
            cursor,
            color,
            zIndex,
            ...attributes
        } = this.props;

        const classes = classNames(
            "cardV2",
                radius ? `radius-${radius}` : false,
                color ? `card-${color}` : false,
                width ? `card-${width}` : false,
                bottom ? `bottom-${bottom}` : false,
                cursor ? `cursor-${cursor}` : false,
                zIndex ? `zIndex-${zIndex}` : false,
                className
        )

        return (
            <Tag {...attributes} className={classes} />
        )
    }
}
CardV2.defaultProps = {
    tag: "div"
}
export default CardV2;
