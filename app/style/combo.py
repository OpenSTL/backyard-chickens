# combo([1, 2, 3], 'abc')
# Output:
# [(1, 'a'), (2, 'b'), (3, 'c')]

def combo(it1, it2):
    list_of_tup= []
    for index, value in enumerate(it1,it2):
        list_of_tup.append((index, value))
    return list_of_tup

it1 =[1,2,3]
it2='abc'

combo(it1,it2)