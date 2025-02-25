function welcome(name: string) {
    console.log('hello')
    const user = {
        name: 'ahmed',
    }
    const fname = user.name
    return name + fname
}

welcome('ahmed')
