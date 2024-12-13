function findType(object, type, array) {
    object.children.forEach((child) => {
        if (child.type === type) {
            array.push(child);
        }
        this.findType(child, type, array);
    });
}