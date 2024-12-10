findType(object, type, array) {
    object.children.forEach((child) => {
        if (child.type === type) {
            arr.push(child);
        }
        this.findType(child, type, array);
    });
}